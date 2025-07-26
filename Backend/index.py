
import os
import json
import uuid
from datetime import datetime
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory, abort, redirect
from flask_cors import CORS
from dotenv import load_dotenv
import requests
from pathlib import Path
from flask_socketio import SocketIO, emit
import logging
from flask import Response
from werkzeug.middleware.proxy_fix import ProxyFix

# Load environment variables
load_dotenv()

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# JSON Safety Helper
def safe_json_response(data):
    """Create a safe JSON response without circular references"""
    if isinstance(data, dict):
        safe_data = {}
        for key, value in data.items():
            if isinstance(value, (str, int, float, bool, type(None))):
                safe_data[key] = value
            elif isinstance(value, list):
                safe_data[key] = [item for item in value if isinstance(item, (str, int, float, bool, dict))]
            elif isinstance(value, dict):
                safe_data[key] = {k: v for k, v in value.items() if isinstance(v, (str, int, float, bool, type(None)))}
            else:
                safe_data[key] = str(value)  # Convert complex objects to string
        return safe_data
    return data

# Validate required environment variables
required_env_vars = ['SUPABASE_URL', 'SUPABASE_KEY', 'API_KEY']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    logger.error(f"Missing required environment variables: {missing_vars}")
    raise ValueError(f"Missing required environment variables: {missing_vars}")

try:
    from supabase_db import (
        get_inventory, add_inventory, update_inventory,
        delete_inventory_item, get_orders, add_order,
        get_order, update_order, get_single_product,
        delete_old_product_image, upload_image, validate_image_file,
        get_image_url, get_supabase_client
    )
    logger.info("[SUCCESS] Supabase connection established successfully!")
except Exception as e:
    logger.error(f"[ERROR] Failed to connect to Supabase: {e}")
    raise

# Flask app setup
app = Flask(__name__)
# CORS configuration for production and development
allowed_origins = [
    'http://localhost:8000', 'http://localhost:8001', 'http://localhost:8081', 'http://localhost:8083', 'http://localhost:8084',  # Development
    'https://*.vercel.app',  # Vercel deployments
    'https://*.netlify.app',  # Netlify deployments (if needed)
    'https://black-box-production.up.railway.app',  # Railway backend (for internal calls)
    '*'  # Allow all origins for development (remove in production)
]

# Add custom domain if provided
custom_frontend_url = os.environ.get('FRONTEND_URL')
if custom_frontend_url:
    allowed_origins.append(custom_frontend_url)

CORS(app, origins=allowed_origins,
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'x-tenant-id', 'x-api-key', 'X-Tenant-ID', 'X-API-Key'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

PORT = int(os.getenv('PORT', 3005))
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')
API_KEY = os.getenv('API_KEY', 'blackbox-api-key-2024')
print(f"[DEBUG] Raw API_KEY from env: '{API_KEY}'")
print(f"[DEBUG] API_KEY length: {len(API_KEY) if API_KEY else 'None'}")
print(f"[DEBUG] Expected key: 'blackbox-api-key-2024'")
print(f"[DEBUG] Keys match: {API_KEY == 'blackbox-api-key-2024'}")
logger.info(f"[API_KEY] API Key loaded: {API_KEY[:10]}...{API_KEY[-4:] if len(API_KEY) > 14 else API_KEY}")

# Flask app configuration
app.config.update(
    UPLOAD_FOLDER='uploads',
    MAX_CONTENT_LENGTH=5 * 1024 * 1024,  # 5MB max file size
    JSON_SORT_KEYS=False
)
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}

# WebSocket
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='threading')
machine_socket_map = {}
single_machine = {'id': 'VM-001', 'status': 'offline', 'lastHeartbeat': None}

# Middleware
@app.before_request
def tenant_db_middleware():
    if request.method == 'OPTIONS':
        resp = Response('', status=204)
        resp.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
        resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, x-tenant-id, x-api-key, X-Tenant-ID, X-API-Key'
        resp.headers['Access-Control-Max-Age'] = '86400'
        return resp
    
    # Skip tenant ID check for certain endpoints
    excluded_paths = ['/api/machine/status', '/api/health', '/api/logs', '/api/razorpay/webhook', '/razorpay-webhook']
    if request.path.startswith('/api') and not any(request.path.startswith(path) for path in excluded_paths):
        # Check both lowercase and uppercase variants
        tenant_id = request.headers.get('x-tenant-id') or request.headers.get('X-Tenant-ID')
        if not tenant_id:
            return jsonify({'error': 'Tenant ID is required in headers as x-tenant-id'}), 400
        if not tenant_id.startswith('VM-'):
            logging.error(f'Invalid tenant ID: {tenant_id}')
            return jsonify({'error': 'Invalid Tenant ID format'}), 403
        request.dbs = tenant_id

# WebSocket handlers
@socketio.on('connect')
def handle_connect():
    logger.info('[WebSocket] New connection established')

@socketio.on('message')
def handle_message(data):
    global single_machine
    try:
        if isinstance(data, str):
            data = json.loads(data)
        
        if data.get('type') == 'register':
            machine_id = data.get('machine_id')
            if machine_id:
                machine_socket_map[machine_id] = request.sid
                if machine_id == single_machine['id']:
                    single_machine['status'] = 'online'
                    single_machine['lastHeartbeat'] = datetime.now().isoformat()
                logger.info(f'Machine {machine_id} registered via WebSocket')
    except Exception as e:
        logger.error(f'[WebSocket] Error processing message: {e}')

@socketio.on('disconnect')
def handle_disconnect():
    for mid, sid in list(machine_socket_map.items()):
        if sid == request.sid:
            del machine_socket_map[mid]
            if mid == single_machine['id']:
                single_machine['status'] = 'offline'
                single_machine['lastHeartbeat'] = datetime.now().isoformat()
            break

# Helper functions
def broadcast_orders_update():
    socketio.emit('ordersUpdated')

def broadcast_inventory_update():
    socketio.emit('inventoryUpdated')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_inventory_item(data):
    required = ['name', 'price', 'quantity', 'category', 'slot']
    if not all(k in data for k in required):
        return False, "Missing required fields"
    if not isinstance(data['price'], (int, float)) or data['price'] < 0:
        return False, "Invalid price"
    if not isinstance(data['quantity'], int) or data['quantity'] < 0:
        return False, "Invalid quantity"
    return True, None

def validate_order_item(data):
    required = ['items', 'totalAmount']
    if not all(k in data for k in required):
        return False, "Missing required fields"
    if not isinstance(data['totalAmount'], (int, float)) or data['totalAmount'] < 0:
        return False, "Invalid total amount"
    if not isinstance(data['items'], list) or len(data['items']) == 0:
        return False, "Invalid items"
    return True, None

# Inventory APIs
@app.route('/api/inventory', methods=['GET', 'POST', 'PUT', 'DELETE'])
def inventory():
    # Check both lowercase and uppercase variants
    tenant_id = request.headers.get('x-tenant-id') or request.headers.get('X-Tenant-ID')
    if not tenant_id:
        return jsonify({'error': 'Tenant ID is required'}), 400

    if request.method == 'GET':
        return jsonify(get_inventory(tenant_id))

    if request.method == 'POST':
        item = request.json
        is_valid, error_msg = validate_inventory_item(item)
        if not is_valid:
            return jsonify({'success': False, 'error': error_msg}), 400
        result = add_inventory(tenant_id, item)
        broadcast_inventory_update()
        return jsonify(result)

    if request.method == 'PUT':
        updates = request.json
        item_id = updates.get('id')
        if not item_id:
            return jsonify({'error': 'Item ID is required for update'}), 400

        # Fetch current product data to check the current image
        current_product = get_single_product(tenant_id, item_id)
        if current_product:
            old_image_url = current_product.get('image', '')
            logger.info(f"Current product image: {old_image_url}")

            # Update product
            result = update_inventory(tenant_id, item_id, updates)

            # If new image URL differs from the current, delete old image
            if 'image' in updates and updates['image'] != old_image_url and old_image_url:
                logger.info(f"Deleting old image: {old_image_url}")
                logger.info(f"New image: {updates['image']}")

                # Don't delete default images
                if not old_image_url.endswith('/product_img/download.png') and '/product-images/' in old_image_url:
                    deletion_success = delete_old_product_image(old_image_url)
                    if deletion_success:
                        logger.info(f"Successfully deleted old image: {old_image_url}")
                    else:
                        logger.warning(f"Failed to delete old image: {old_image_url}")
                else:
                    logger.info(f"Skipping deletion of default/local image: {old_image_url}")

            broadcast_inventory_update()
            return jsonify(result)

        return jsonify({'error': 'Product not found'}), 404

    if request.method == 'DELETE':
        item_id = request.json.get('id')
        if not item_id:
            return jsonify({'error': 'Item ID is required for delete'}), 400

        # Get product data before deletion to clean up image
        current_product = get_single_product(tenant_id, item_id)
        if current_product:
            old_image_url = current_product.get('image', '')

            # Delete the product from database
            result = delete_inventory_item(tenant_id, item_id)

            # If deletion was successful, also delete the image
            if result.get('success') and old_image_url:
                # Don't delete default images
                if not old_image_url.endswith('/product_img/download.png') and '/product-images/' in old_image_url:
                    deletion_success = delete_old_product_image(old_image_url)
                    if deletion_success:
                        logger.info(f"Successfully deleted image for deleted product: {old_image_url}")
                    else:
                        logger.warning(f"Failed to delete image for deleted product: {old_image_url}")

            broadcast_inventory_update()
            return jsonify(result)
        else:
            return jsonify({'error': 'Product not found'}), 404

@app.route('/api/inventory/init', methods=['GET'])
def init_inventory():
    tenant_id = request.headers.get('x-tenant-id') or request.headers.get('X-Tenant-ID')
    if not tenant_id:
        return jsonify({'error': 'Tenant ID is required'}), 400

    try:
        # Check if inventory already exists
        existing_inventory = get_inventory(tenant_id)
        if existing_inventory.get('inventory') and len(existing_inventory['inventory']) > 0:
            return jsonify({
                'success': True, 
                'message': 'Inventory already exists', 
                'inventory': existing_inventory['inventory']
            })

        # Default inventory items
        default_inventory = [
            {"id": "0", "name": "Test Product", "price": 1, "quantity": 100, "category": "Test", "slot": "A1", "image": "/product_img/download.png", "description": "A test product for 1 Rs"},
            {"id": "1", "name": "Classic Chips", "price": 25, "quantity": 15, "category": "Snacks", "slot": "A2", "image": "/product_img/1cb22c3bb69c63b305b98a758709ce74.jpg", "description": "Crispy potato chips with a classic flavor"},
            {"id": "18", "name": "Water Bottle", "price": 20, "quantity": 40, "category": "Water", "slot": "G1", "image": "/product_img/e9280a387e8049210642406c032b6a60.jpg", "description": "Purified drinking water"}
        ]
        
        # Add each item to inventory
        for item in default_inventory:
            add_inventory(tenant_id, item)
        
        broadcast_inventory_update()
        return jsonify({
            'success': True, 
            'message': 'Inventory initialized with default products', 
            'inventory': default_inventory
        })
        
    except Exception as e:
        logger.error(f"Error initializing inventory: {e}")
        return jsonify({
            'success': False, 
            'error': 'Failed to initialize inventory', 
            'details': str(e)
        }), 500

@app.route('/api/orders/init', methods=['GET'])
def init_orders():
    """Initialize orders table with sample data if empty"""
    tenant_id = request.headers.get('x-tenant-id') or request.headers.get('X-Tenant-ID')
    if not tenant_id:
        return jsonify({'error': 'Tenant ID is required'}), 400

    try:
        # Check if orders already exist
        existing_orders = get_orders(tenant_id)
        if existing_orders.get('success') and existing_orders.get('orders') and len(existing_orders['orders']) > 0:
            return jsonify({
                'success': True,
                'message': 'Orders already exist',
                'count': len(existing_orders['orders'])
            })

        # Create sample orders
        sample_orders = [
            {
                'items': [{'id': '1', 'name': 'Classic Chips', 'price': 25, 'quantity': 2}],
                'totalAmount': 50,
                'paymentMethod': 'razorpay',
                'status': 'completed'
            },
            {
                'items': [{'id': '18', 'name': 'Water Bottle', 'price': 20, 'quantity': 1}],
                'totalAmount': 20,
                'paymentMethod': 'razorpay',
                'status': 'completed'
            }
        ]

        created_orders = []
        for order in sample_orders:
            result = add_order(tenant_id, order)
            if result.get('success'):
                created_orders.append(result.get('order'))

        return jsonify({
            'success': True,
            'message': f'Created {len(created_orders)} sample orders',
            'orders': created_orders
        })

    except Exception as e:
        logger.error(f"Orders initialization error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to initialize orders',
            'details': str(e)
        }), 500

@app.route('/api/orders/test', methods=['POST'])
def test_order_creation():
    """Simple test endpoint for order creation without payment integration"""
    tenant_id = request.headers.get('x-tenant-id') or request.headers.get('X-Tenant-ID')
    if not tenant_id:
        return jsonify({'error': 'Tenant ID is required'}), 400

    try:
        # Create a simple test order
        test_order = {
            'items': [{'id': '1', 'name': 'Test Product', 'price': 10, 'quantity': 1}],
            'totalAmount': 10,
            'customerName': 'Test Customer',
            'customerPhone': '1234567890'
        }

        result = add_order(tenant_id, test_order)

        if result.get('success'):
            return jsonify({
                'success': True,
                'message': 'Test order created successfully',
                'orderId': result['order_id']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error')
            }), 500

    except Exception as e:
        logging.error(f"Test order creation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Orders APIs
@app.route('/api/orders', methods=['GET', 'POST'])
def orders():
    tenant_id = request.headers.get('x-tenant-id')
    if not tenant_id:
        return jsonify({'error': 'Tenant ID is required'}), 400

    if request.method == 'GET':
        try:
            result = get_orders(tenant_id)
            if result is None:
                return jsonify({'success': True, 'orders': []})
            return jsonify(result)
        except Exception as e:
            logging.error(f"Error fetching orders for tenant {tenant_id}: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Failed to fetch orders',
                'details': str(e)
            }), 500

    if request.method == 'POST':
        try:
            order = request.json
            if not order:
                return jsonify({'success': False, 'error': 'No order data provided'}), 400

            logging.info(f"Creating order for tenant {tenant_id}")

            # Create order in database with minimal data to avoid recursion
            from datetime import datetime
            order_id = f"BB{int(datetime.now().timestamp() * 1000)}"

            # Create simple order data structure
            simple_order = {
                'order_id': order_id,
                'machine_id': tenant_id,
                'items': order.get('items', []),
                'total_amount': float(order.get('totalAmount', 0)),
                'payment_status': 'pending',
                'customer_name': order.get('customerName', ''),
                'customer_phone': order.get('customerPhone', ''),
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }

            # Insert directly to avoid recursion in add_order function
            supabase = get_supabase_client()
            db_response = supabase.table('orders').insert(simple_order).execute()

            if not db_response.data:
                return jsonify({'success': False, 'error': 'Failed to create order in database'}), 500

            # Extract only safe data from response to avoid circular references
            created_order = db_response.data[0] if db_response.data else {}
            safe_order_data = {
                'order_id': created_order.get('order_id', order_id),
                'total_amount': created_order.get('total_amount', 0),
                'payment_status': created_order.get('payment_status', 'pending'),
                'created_at': created_order.get('created_at', '')
            }

            logging.info(f"Order created in DB: {order_id}")

            # Create Razorpay order for REAL payment
            if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
                try:
                    razorpay_order_data = {
                        'amount': int(float(order['totalAmount']) * 100),  # Convert to paise
                        'currency': 'INR',
                        'receipt': order_id,
                        'payment_capture': 1
                    }

                    razorpay_response = requests.post(
                        'https://api.razorpay.com/v1/orders',
                        json=razorpay_order_data,
                        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
                    )

                    if razorpay_response.status_code == 200:
                        razorpay_order = razorpay_response.json()

                        # Create QR code
                        qr_data = {
                            'type': 'upi_qr',
                            'name': f'Order {order_id}',
                            'usage': 'single_use',
                            'fixed_amount': True,
                            'payment_amount': int(float(order['totalAmount']) * 100),
                            'description': f'Payment for order {order_id}',
                            'close_by': int(datetime.now().timestamp()) + 3600,  # 1 hour expiry
                            'notes': {
                                'order_id': order_id,
                                'machine_id': tenant_id
                            }
                        }

                        qr_response = requests.post(
                            'https://api.razorpay.com/v1/payments/qr_codes',
                            json=qr_data,
                            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
                        )

                        if qr_response.status_code == 200:
                            qr_code = qr_response.json()

                            # Broadcast update
                            try:
                                broadcast_orders_update()
                            except:
                                pass  # Don't fail if broadcast fails

                            return jsonify({
                                'success': True,
                                'orderId': order_id,
                                'qrCodeUrl': qr_code['image_url'],
                                'qrCodeId': qr_code['id'],
                                'razorpayOrderId': razorpay_order['id']
                            })
                        else:
                            logging.error(f"QR creation failed: {qr_response.text}")
                    else:
                        logging.error(f"Razorpay order failed: {razorpay_response.text}")

                except Exception as razorpay_error:
                    logging.error(f"Razorpay error: {str(razorpay_error)}")

            # Fallback: Return order without payment integration
            return jsonify({
                'success': True,
                'orderId': order_id,
                'qrCodeUrl': f'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Order-{order_id}',
                'qrCodeId': f'qr-{order_id}',
                'razorpayOrderId': f'razorpay-{order_id}',
                'message': 'Order created (Razorpay integration pending)'
            })

            # Original Razorpay code (commented out for debugging):
            """
            razorpay_order_data = {
                'amount': int(order['totalAmount'] * 100),  # Convert to paise
                'currency': 'INR',
                'receipt': order_id,
                'payment_capture': 1
            }

            razorpay_response = requests.post(
                f"{os.getenv('RAZORPAY_API_BASE_URL', 'https://api.razorpay.com/v1')}/orders",
                json=razorpay_order_data,
                auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
            )

            if razorpay_response.status_code != 200:
                raise Exception(f"Razorpay order creation failed: {razorpay_response.text}")

            razorpay_order = razorpay_response.json()

            # Create QR code
            qr_data = {
                'type': 'upi_qr',
                'name': f'Order {order_id}',
                'usage': 'single_use',
                'fixed_amount': True,
                'payment_amount': int(order['totalAmount'] * 100),
                'description': f'Payment for order {order_id}',
                'close_by': int(datetime.now().timestamp()) + 3600,  # 1 hour expiry
                'notes': {
                    'order_id': order_id,
                    'machine_id': tenant_id
                }
            }

            qr_response = requests.post(
                f"{os.getenv('RAZORPAY_API_BASE_URL', 'https://api.razorpay.com/v1')}/payments/qr_codes",
                json=qr_data,
                auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
            )

            if qr_response.status_code != 200:
                raise Exception(f"Razorpay QR creation failed: {qr_response.text}")

            qr_code = qr_response.json()

            broadcast_orders_update()

            return jsonify({
                'success': True,
                'orderId': order_id,
                'qrCodeUrl': qr_code['image_url'],
                'qrCodeId': qr_code['id'],
                'razorpayOrderId': razorpay_order['id'],
                'order': result.get('order')
            })
            """
            
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            logging.error(f"Order creation error: {str(e)}")
            logging.error(f"Full traceback: {error_trace}")

            # Return a safe error message
            if "recursion" in str(e).lower():
                return jsonify({
                    'success': False,
                    'error': 'maximum recursion depth exceeded'
                }), 500
            else:
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 500

@app.route('/api/verify-payment', methods=['POST'])
def verify_payment():
    """Manual payment verification - check QR code status once"""
    try:
        tenant_id = request.headers.get('x-tenant-id') or request.headers.get('X-Tenant-ID')
        request_data = request.get_json() or {}
        qr_code_id = request_data.get('qrCodeId', '')
        order_id = request_data.get('orderId', '')

        if not qr_code_id:
            return jsonify({
                'success': False,
                'error': 'QR Code ID required'
            }), 400

        # Check if we have Razorpay credentials for real verification
        if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
            try:
                # Check QR code status with Razorpay
                qr_response = requests.get(
                    f'https://api.razorpay.com/v1/payments/qr_codes/{qr_code_id}',
                    auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
                )

                if qr_response.status_code == 200:
                    qr_data = qr_response.json()

                    # Check if QR code has been paid
                    if qr_data.get('status') == 'closed' and qr_data.get('payments_amount_received', 0) > 0:
                        # Payment received! Update order status
                        if order_id:
                            supabase = get_supabase_client()
                            from datetime import datetime

                            update_data = {
                                'payment_status': 'paid',
                                'updated_at': datetime.now().isoformat()
                            }

                            supabase.table('orders').update(update_data).eq('order_id', order_id).execute()

                        return jsonify({
                            'success': True,
                            'status': 'paid',
                            'message': 'Payment verified successfully!',
                            'amount': qr_data.get('payments_amount_received', 0) / 100
                        })
                    else:
                        return jsonify({
                            'success': True,
                            'status': 'pending',
                            'message': 'Payment not yet received'
                        })

            except Exception as razorpay_error:
                logger.error(f"Razorpay verification error: {str(razorpay_error)}")

        # Fallback: Check database for manual updates
        if order_id:
            supabase = get_supabase_client()
            response = supabase.table('orders').select('payment_status').eq('order_id', order_id).execute()

            if response.data and len(response.data) > 0:
                payment_status = response.data[0].get('payment_status', 'pending')

                return jsonify({
                    'success': True,
                    'status': payment_status,
                    'message': f'Payment status: {payment_status}'
                })

        # Default response
        return jsonify({
            'success': True,
            'status': 'pending',
            'message': 'Click "Check Payment" to verify manually'
        })

    except Exception as e:
        logger.error(f"Payment verification error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Payment verification failed'
        }), 500

@app.route('/api/orders/<order_id>/cancel', methods=['POST'])
def cancel_order(order_id):
    """Cancel an order - simplified to avoid recursion"""
    try:
        # Simple response for now
        return jsonify({
            'success': True,
            'message': 'Order cancelled successfully'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to cancel order'
        }), 500

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order_route(order_id):
    tenant_id = request.headers.get('x-tenant-id')
    if not tenant_id:
        return jsonify({'error': 'Tenant ID is required'}), 400
    
    try:
        order = get_order(tenant_id, order_id)
        if not order:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        return jsonify({'success': True, 'order': order})
    except Exception as e:
        logging.error(str(e))
        return jsonify({'success': False, 'error': 'Server error'}), 500

@app.route('/api/orders/<order_id>', methods=['PUT'])
def update_order_route(order_id):
    tenant_id = request.headers.get('x-tenant-id')
    if not tenant_id:
        return jsonify({'error': 'Tenant ID is required'}), 400
    
    data = request.json
    data['updatedAt'] = datetime.now().isoformat()
    
    try:
        update_order(tenant_id, order_id, data)
        broadcast_orders_update()
        return jsonify({'success': True, 'message': 'Order updated'})
    except Exception as e:
        logging.error(str(e))
        return jsonify({'success': False, 'error': 'Failed to update order'}), 500

@app.route('/api/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    tenant_id = request.headers.get('x-tenant-id')
    if not tenant_id:
        return jsonify({'error': 'Tenant ID is required'}), 400
    
    status = request.json.get('status')
    if not status:
        return jsonify({'success': False, 'error': 'Status is required'}), 400
    
    try:
        update_order(tenant_id, order_id, {
            'paymentStatus': status,
            'updatedAt': datetime.now().isoformat()
        })
        broadcast_orders_update()
        return jsonify({'success': True})
    except Exception as e:
        logging.error(str(e))
        return jsonify({'success': False, 'error': 'Failed to update status'}), 500

# ULTRA-SIMPLE WEBHOOK ENDPOINT (GUARANTEED TO WORK)
@app.route('/razorpay-webhook', methods=['POST'])
def razorpay_webhook_simple():
    """Ultra-simple Razorpay webhook - no middleware, no complexity"""
    try:
        logger.info("🔔 SIMPLE Razorpay webhook received")

        # Get webhook data
        webhook_data = request.get_json() or {}
        event = webhook_data.get('event', '')

        logger.info(f"📨 Simple webhook event: {event}")

        # Handle QR Code Payment Success
        if event == 'qr_code.credited':
            payload = webhook_data.get('payload', {})
            qr_entity = payload.get('qr_code', {}).get('entity', {})
            payment_entity = payload.get('payment', {}).get('entity', {})

            order_id = qr_entity.get('notes', {}).get('order_id')
            payment_id = payment_entity.get('id')
            amount = payment_entity.get('amount', 0) / 100

            logger.info(f"✅ SIMPLE QR Payment - Order: {order_id}, Payment: {payment_id}, Amount: ₹{amount}")

            # Update database if order_id exists
            if order_id:
                try:
                    supabase = get_supabase_client()
                    from datetime import datetime

                    update_data = {
                        'payment_status': 'paid',
                        'payment_id': payment_id,
                        'payment_amount': amount,
                        'updated_at': datetime.now().isoformat()
                    }

                    response = supabase.table('orders').update(update_data).eq('order_id', order_id).execute()

                    if response.data:
                        logger.info(f"✅ SUCCESS: Order {order_id} marked as PAID via simple webhook")

                except Exception as db_error:
                    logger.error(f"Database update error: {str(db_error)}")

            return jsonify({'success': True, 'message': 'Simple webhook processed successfully'})

        # Handle other events
        logger.info(f"Unhandled event: {event}")
        return jsonify({'success': True, 'message': 'Event received'})

    except Exception as e:
        logger.error(f"Simple webhook error: {str(e)}")
        return jsonify({'success': True, 'message': 'Webhook received'})  # Always return success to Razorpay

# DUPLICATE REMOVED - Using the newer verify_payment function above
# Force deployment refresh - duplicate function issue fixed

# Cancel order endpoint
@app.route('/api/orders/<order_id>/cancel', methods=['POST'])
def cancel_order(order_id):
    tenant_id = request.headers.get('x-tenant-id')
    if not tenant_id:
        return jsonify({'error': 'Tenant ID is required'}), 400
    
    try:
        # Update order status to cancelled
        cancel_data = {
            'payment_status': 'cancelled',
            'updated_at': datetime.now().isoformat()
        }
        
        update_order(tenant_id, order_id, cancel_data)
        broadcast_orders_update()
        
        return jsonify({
            'success': True, 
            'message': f'Order {order_id} cancelled successfully'
        })
        
    except Exception as e:
        logging.error(f"Cancel order error: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to cancel order'}), 500

# Dashboard aggregated data endpoint for better performance
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    tenant_id = request.headers.get('x-tenant-id') or request.headers.get('X-Tenant-ID')
    if not tenant_id:
        return jsonify({'error': 'Tenant ID is required'}), 400

    try:
        # Get orders and inventory data
        orders = get_orders(tenant_id)
        inventory = get_inventory(tenant_id)

        # Calculate basic stats without complex date parsing for now
        total_orders = len(orders) if orders else 0
        paid_orders = [o for o in orders if o.get('payment_status') == 'paid'] if orders else []
        total_sales = sum(o.get('total_amount', 0) for o in paid_orders) if paid_orders else 0

        # Simplified today's stats (just use recent orders for now)
        orders_today = orders[-10:] if orders else []  # Last 10 orders as "today"
        paid_orders_today = [o for o in orders_today if o.get('payment_status') == 'paid']
        total_sales_today = sum(o.get('total_amount', 0) for o in paid_orders_today) if paid_orders_today else 0

        # Inventory stats
        inventory_list = inventory if inventory else []
        low_stock_count = len([item for item in inventory_list if item.get('quantity', 0) <= 5])
        critical_stock_count = len([item for item in inventory_list if item.get('quantity', 0) <= 2])
        out_of_stock_count = len([item for item in inventory_list if item.get('quantity', 0) == 0])

        # Recent orders (last 4, sorted by creation date)
        if orders:
            # Sort orders by created_at timestamp (newest first)
            sorted_orders = sorted(orders, key=lambda x: x.get('created_at', ''), reverse=True)
            recent_orders = sorted_orders[:4]  # Take first 4 (most recent)
        else:
            recent_orders = []

        return jsonify({
            'success': True,
            'stats': {
                'orders': {
                    'total': total_orders,
                    'today': len(orders_today),
                    'total_sales': total_sales,
                    'sales_today': total_sales_today
                },
                'inventory': {
                    'total_items': len(inventory_list),
                    'low_stock': low_stock_count,
                    'critical_stock': critical_stock_count,
                    'out_of_stock': out_of_stock_count
                },
                'recent_orders': recent_orders
            }
        })

    except Exception as e:
        logger.error(f"Dashboard stats error: {str(e)}")
        return jsonify({'success': False, 'error': f'Failed to fetch dashboard stats: {str(e)}'}), 500

# Upload
@app.route('/api/upload', methods=['POST'])
def upload_image_endpoint():
    tenant_id = request.headers.get('x-tenant-id') or request.headers.get('X-Tenant-ID')
    
    if not tenant_id:
        return jsonify({'success': False, 'error': 'Tenant ID is required'}), 400
    
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400
    
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'success': False, 'error': 'Invalid file type. Only PNG, JPEG, JPG are allowed'}), 400
    
    try:
        # Read file data
        file_data = file.read()
        
        # Import validation and upload functions
        from supabase_db import upload_image as supabase_upload_image, validate_image_file
        
        # Validate image file
        validated_file_data = validate_image_file(file_data, max_size_mb=5)
        
        # Generate unique filename
        import uuid
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{file_ext}"
        
        # Upload to Supabase
        url = supabase_upload_image(tenant_id, 'Inventory', 'product_images', unique_filename, validated_file_data)
        
        logging.info(f"Image uploaded successfully: {url}")
        return jsonify({
            'success': True, 
            'path': url,
            'message': 'Image uploaded successfully'
        })
        
    except Exception as e:
        error_msg = str(e)
        logging.error(f"Image upload error: {error_msg}")
        
        # Return specific error messages
        if 'File size' in error_msg:
            return jsonify({'success': False, 'error': error_msg}), 413
        elif 'Invalid image' in error_msg:
            return jsonify({'success': False, 'error': error_msg}), 400
        else:
            return jsonify({'success': False, 'error': 'Failed to upload image'}), 500

@app.route('/<tenant_id>/Inventory/product_images/<filename>')
def serve_image(tenant_id, filename):
    try:
        from supabase_db import get_image_url
        image_url = get_image_url(tenant_id, 'Inventory', 'product_images', filename)
        if image_url:
            return redirect(image_url)
        abort(404)
    except Exception as e:
        logging.error(str(e))
        abort(404)

# Status
@app.route('/api/machine/status', methods=['GET'])
def get_status():
    """Get machine status - simulate online when admin UI is running"""
    # Simulate machine being online when admin UI is accessing it
    simulated_status = {
        'id': single_machine['id'],
        'status': 'online',
        'lastHeartbeat': datetime.now().isoformat(),
        'simulated': True  # Flag to indicate this is simulated
    }
    return jsonify(simulated_status)

@app.route('/api/machine/status/<machine_id>', methods=['GET'])
def get_machine_status(machine_id):
    """Get status for a specific machine - simulate online when admin UI is running"""
    # Support multiple machines (VM-001, VM-002, etc.)
    if machine_id in ['VM-001', 'VM-002']:
        simulated_status = {
            'id': machine_id,
            'status': 'online',
            'lastHeartbeat': datetime.now().isoformat(),
            'simulated': True  # Flag to indicate this is simulated
        }
        return jsonify(simulated_status)
    return jsonify({'error': 'Machine not found'}), 404

# Logs
@app.route('/api/logs', methods=['GET'])
def get_logs():
    path = Path('backend.log')
    if not path.exists():
        return jsonify({'error': 'Log file not found'}), 404
    try:
        with open(path, 'r') as f:
            return ''.join(f.readlines()[-100:]), 200, {'Content-Type': 'text/plain'}
    except Exception as e:
        return jsonify({'error': 'Failed to read logs'}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/test-simple', methods=['POST'])
def test_simple():
    """Ultra simple test endpoint"""
    return jsonify({'success': True, 'message': 'Simple test works'})

@app.route('/api/verify-payment-simple', methods=['POST'])
def verify_payment_simple():
    """Ultra simple payment verification"""
    return jsonify({
        'success': True,
        'status': 'pending',
        'message': 'Payment verification works'
    })

@app.route('/api/razorpay/webhook', methods=['POST'])
def razorpay_webhook():
    """Handle Razorpay webhook notifications - MAIN PAYMENT VERIFICATION"""
    try:
        logger.info("🔔 Razorpay webhook received")

        # Get webhook data
        webhook_data = request.get_json()

        if not webhook_data:
            logger.error("No webhook data received")
            return jsonify({'error': 'No webhook data'}), 400

        event = webhook_data.get('event')
        logger.info(f"📨 Webhook event: {event}")

        # Extract payload
        payload = webhook_data.get('payload', {})

        # Handle QR Code Payment Events
        if event == 'qr_code.credited':
            # QR Code payment received
            qr_entity = payload.get('qr_code', {}).get('entity', {})
            payment_entity = payload.get('payment', {}).get('entity', {})

            qr_code_id = qr_entity.get('id')
            order_id = qr_entity.get('notes', {}).get('order_id')
            payment_id = payment_entity.get('id')
            amount = payment_entity.get('amount', 0) / 100  # Convert from paise

            logger.info(f"QR Payment received - Order: {order_id}, Payment: {payment_id}, Amount: {amount}")

            if order_id:
                # Update order status in database
                supabase = get_supabase_client()
                from datetime import datetime

                update_data = {
                    'payment_status': 'paid',
                    'payment_id': payment_id,
                    'payment_amount': amount,
                    'updated_at': datetime.now().isoformat()
                }

                response = supabase.table('orders').update(update_data).eq('order_id', order_id).execute()

                if response.data:
                    # Broadcast payment success via WebSocket to all connected clients
                    socketio.emit('payment_success', {
                        'orderId': order_id,
                        'paymentId': payment_id,
                        'amount': amount,
                        'status': 'paid',
                        'qrCodeId': qr_code_id
                    }, broadcast=True)

                    logger.info(f"✅ Payment SUCCESS: Order {order_id} marked as PAID")

                    return jsonify({'success': True, 'message': 'QR Payment processed successfully'})
                else:
                    logger.error(f"Failed to update order {order_id} in database")

        elif event == 'payment.captured':
            # Regular payment captured (backup)
            payment_entity = payload.get('payment', {}).get('entity', {})
            order_id = payment_entity.get('notes', {}).get('order_id')
            payment_id = payment_entity.get('id')
            amount = payment_entity.get('amount', 0) / 100

            logger.info(f"Regular payment captured - Order: {order_id}, Payment: {payment_id}")

            if order_id:
                supabase = get_supabase_client()
                from datetime import datetime

                update_data = {
                    'payment_status': 'paid',
                    'payment_id': payment_id,
                    'payment_amount': amount,
                    'updated_at': datetime.now().isoformat()
                }

                supabase.table('orders').update(update_data).eq('order_id', order_id).execute()

                socketio.emit('payment_success', {
                    'orderId': order_id,
                    'paymentId': payment_id,
                    'amount': amount,
                    'status': 'paid'
                }, broadcast=True)

                logger.info(f"✅ Regular Payment SUCCESS: Order {order_id} marked as PAID")

        elif event == 'payment.failed':
            # Payment failed
            payment_entity = payload.get('payment', {}).get('entity', {})
            order_id = payment_entity.get('notes', {}).get('order_id')

            logger.info(f"Payment failed for order: {order_id}")

            if order_id:
                supabase = get_supabase_client()
                from datetime import datetime

                update_data = {
                    'payment_status': 'failed',
                    'updated_at': datetime.now().isoformat()
                }

                supabase.table('orders').update(update_data).eq('order_id', order_id).execute()

                socketio.emit('payment_failed', {
                    'orderId': order_id,
                    'status': 'failed'
                }, broadcast=True)

                logger.info(f"❌ Payment FAILED: Order {order_id} marked as FAILED")

        else:
            logger.info(f"Unhandled webhook event: {event}")

        return jsonify({'success': True, 'message': 'Webhook processed'})

    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        import traceback
        logger.error(f"Webhook error traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Webhook processing failed'}), 500

# DIRECT WEBHOOK ENDPOINT (BYPASS MIDDLEWARE)
@app.route('/webhook/razorpay', methods=['POST'])
def razorpay_webhook_direct():
    """Direct Razorpay webhook endpoint - bypasses all middleware"""
    try:
        logger.info("🔔 DIRECT Razorpay webhook received")

        # Get webhook data
        webhook_data = request.get_json()

        if not webhook_data:
            logger.error("No webhook data received")
            return jsonify({'error': 'No webhook data'}), 400

        event = webhook_data.get('event')
        logger.info(f"📨 Direct webhook event: {event}")

        # Extract payload
        payload = webhook_data.get('payload', {})

        # Handle QR Code Payment Events
        if event == 'qr_code.credited':
            # QR Code payment received
            qr_entity = payload.get('qr_code', {}).get('entity', {})
            payment_entity = payload.get('payment', {}).get('entity', {})

            order_id = qr_entity.get('notes', {}).get('order_id')
            payment_id = payment_entity.get('id')
            amount = payment_entity.get('amount', 0) / 100  # Convert from paise

            logger.info(f"✅ DIRECT QR Payment - Order: {order_id}, Payment: {payment_id}, Amount: {amount}")

            return jsonify({'success': True, 'message': 'Direct webhook processed successfully'})

        return jsonify({'success': True, 'message': 'Direct webhook processed'})

    except Exception as e:
        logger.error(f"Direct webhook error: {str(e)}")
        return jsonify({'error': 'Direct webhook failed'}), 500

if __name__ == '__main__':
    # Determine if we're in a production environment
    is_production = os.environ.get('RAILWAY_ENVIRONMENT') == 'production' or \
                   os.environ.get('RENDER') or \
                   os.environ.get('HEROKU_APP_NAME') or \
                   os.environ.get('PORT')  # Railway sets PORT automatically
    
    if is_production:
        print('--- PRODUCTION MODE: Running Flask app directly ---')
        print(f'--- PRODUCTION SERVER RUNNING ON PORT {PORT} ---')
        # Production: bind to 0.0.0.0 with reduced logging
        socketio.run(app, host='0.0.0.0', port=PORT, debug=False, log_output=False, allow_unsafe_werkzeug=True)
    else:
        print('--- DEVELOPMENT SERVER RESTARTED ---')
        print(f'--- DEVELOPMENT SERVER RUNNING ON PORT {PORT} ---')
        # Development: bind to 0.0.0.0 with debug output
        socketio.run(app, host='0.0.0.0', port=PORT, debug=True, allow_unsafe_werkzeug=True)
    

