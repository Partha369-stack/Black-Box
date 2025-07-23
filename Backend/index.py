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
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

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
        get_image_url
    )
    logger.info("✅ Supabase connection established successfully!")
except Exception as e:
    logger.error(f"❌ Failed to connect to Supabase: {e}")
    raise

# Flask app setup
app = Flask(__name__)
CORS(app, origins=['http://localhost:8000', 'http://localhost:8001', 'http://localhost:8081', 'http://localhost:8083'],
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'x-tenant-id', 'x-api-key', 'X-Tenant-ID', 'X-API-Key'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

PORT = int(os.getenv('PORT', 3005))
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')
API_KEY = os.getenv('API_KEY', 'blackbox-api-key-2024')
logger.info(f"🔑 API Key loaded: {API_KEY[:10]}...{API_KEY[-4:] if len(API_KEY) > 14 else API_KEY}")

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
    
    # API Key validation for sensitive operations
    if request.path.startswith('/api') and request.method != 'GET':
        # Check both lowercase and uppercase variants
        api_key = request.headers.get('x-api-key') or request.headers.get('X-API-Key')
        if not api_key or api_key != API_KEY:
            logger.warning(f"Invalid API key attempt from {request.remote_addr} for {request.path}")
            return jsonify({'error': 'Invalid or missing API key'}), 401
    
    # Skip tenant ID check for certain endpoints
    excluded_paths = ['/api/machine/status', '/api/health', '/api/logs']
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

            # Update product
            result = update_inventory(tenant_id, item_id, updates)

            # If new image URL differs from the current, delete old image
            if 'image' in updates and updates['image'] != old_image_url:
                delete_old_product_image(old_image_url)

            broadcast_inventory_update()
            return jsonify(result)

        return jsonify({'error': 'Product not found'}), 404

    if request.method == 'DELETE':
        item_id = request.json.get('id')
        if not item_id:
            return jsonify({'error': 'Item ID is required for delete'}), 400
        result = delete_inventory_item(tenant_id, item_id)
        broadcast_inventory_update()
        return jsonify(result)

# Orders APIs
@app.route('/api/orders', methods=['GET', 'POST'])
def orders():
    tenant_id = request.headers.get('x-tenant-id')
    if not tenant_id:
        return jsonify({'error': 'Tenant ID is required'}), 400

    # Validate API key for orders endpoint
    api_key = request.headers.get('x-api-key')
    if not api_key or api_key != API_KEY:
        return jsonify({'error': 'Unauthorized - Invalid API key'}), 401

    if request.method == 'GET':
        return jsonify(get_orders(tenant_id))

    if request.method == 'POST':
        try:
            order = request.json
            if not order:
                return jsonify({'success': False, 'error': 'No order data provided'}), 400
                
            is_valid, error_msg = validate_order_item(order)
            if not is_valid:
                return jsonify({'success': False, 'error': error_msg}), 400
                
            logging.info(f"Processing order for tenant {tenant_id}: {order}")
            result = add_order(tenant_id, order)
            broadcast_orders_update()
            
            return jsonify({'success': True, 'order': result})
        except Exception as e:
            error_msg = str(e)
            logging.error(f"Orders POST error for tenant {tenant_id}: {error_msg}")
            return jsonify({'success': False, 'error': 'Failed to process order'}), 500

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
    """Get machine status"""
    return jsonify(single_machine)

@app.route('/api/machine/status/<machine_id>', methods=['GET'])
def get_machine_status(machine_id):
    """Get status for a specific machine"""
    if machine_id == single_machine['id']:
        return jsonify(single_machine)
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

if __name__ == '__main__':
    print('--- SERVER RESTARTED ---')
    print(f'--- SERVER RUNNING ON PORT {PORT} ---')
    socketio.run(app, port=PORT, debug=False, allow_unsafe_werkzeug=True)
    

