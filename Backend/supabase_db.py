import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

print(f"🔗 Supabase URL: {SUPABASE_URL[:30]}..." if SUPABASE_URL else "❌ No Supabase URL found")
print(f"🔑 Supabase Key: {SUPABASE_KEY[:20]}..." if SUPABASE_KEY else "❌ No Supabase Key found")

def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise Exception("Missing Supabase credentials. Please check your .env file.")
    
    try:
        # Create client with service role key - this should bypass RLS automatically
        client = create_client(
            SUPABASE_URL, 
            SUPABASE_KEY
        )
        return client
    except Exception as e:
        raise Exception(f"Failed to create Supabase client: {str(e)}")

def get_inventory(machine_id: str):
    """Get inventory for a machine from inventory table only - ordered by created_at"""
    supabase = get_supabase_client()
    
    # Get from inventory table only, ordered by creation date (newest first)
    inventory_response = supabase.table('inventory').select('*').eq('machine_id', machine_id).order('created_at', desc=True).execute()
    inventory_data = inventory_response.data
    
    return {'success': True, 'inventory': inventory_data}

def get_single_product(machine_id: str, item_id: str):
    """Get a single product from inventory"""
    supabase = get_supabase_client()
    
    response = supabase.table('inventory').select('*').eq('machine_id', machine_id).eq('id', item_id).execute()
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None

def add_inventory(machine_id: str, item: dict):
    supabase = get_supabase_client()
    
    # Insert into inventory table
    response = supabase.table('inventory').insert({'machine_id': machine_id, **item}).execute()
    return {'success': True, 'data': response.data}

def update_inventory(machine_id: str, item_id: str, updates: dict):
    supabase = get_supabase_client()
    # First, update the `inventory` table
    response = supabase.table('inventory').update(updates).eq('machine_id', machine_id).eq('id', item_id).execute()

    return {'success': True, 'data': response.data}

def delete_inventory_item(machine_id: str, item_id: str):
    supabase = get_supabase_client()
    response = supabase.table('inventory').delete().eq('machine_id', machine_id).eq('id', item_id).execute()
    return {'success': True, 'data': response.data}

def get_orders(machine_id: str):
    """Get orders for a machine from orders table - ordered by created_at"""
    supabase = get_supabase_client()
    try:
        response = supabase.table('orders').select('*').eq('machine_id', machine_id).order('created_at', desc=True).execute()
        return {'success': True, 'orders': response.data}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def add_order(machine_id: str, order: dict):
    """Create a new order in the database - simplified to avoid recursion"""
    try:
        supabase = get_supabase_client()
        from datetime import datetime

        # Generate a proper order ID
        order_id = f"BB{int(datetime.now().timestamp() * 1000)}"

        # Create simple, safe order data
        order_data = {
            'order_id': order_id,
            'machine_id': machine_id,
            'items': order.get('items', []),  # Keep as-is, let Supabase handle JSON
            'total_amount': order.get('totalAmount', 0),
            'payment_status': 'pending',
            'customer_name': order.get('customerName', ''),
            'customer_phone': order.get('customerPhone', ''),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }

        # Insert into database
        response = supabase.table('orders').insert(order_data).execute()

        if response.data and len(response.data) > 0:
            return {
                'success': True,
                'order_id': order_id,
                'order': response.data[0]
            }
        else:
            return {
                'success': False,
                'error': 'No data returned from database'
            }

    except Exception as e:
        print(f"Error in add_order: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def get_order(machine_id: str, order_id: str):
    supabase = get_supabase_client()
    try:
        response = supabase.table('orders').select('*').eq('machine_id', machine_id).eq('order_id', order_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        raise Exception(f"Database error while fetching order: {str(e)}")

def update_order(machine_id: str, order_id: str, update_data: dict):
    supabase = get_supabase_client()
    try:
        response = supabase.table('orders').update(update_data).eq('machine_id', machine_id).eq('order_id', order_id).execute()
        return response.data
    except Exception as e:
        raise Exception(f"Database error while updating order: {str(e)}")

def create_storage_bucket_if_not_exists():
    """Create the product-images bucket if it doesn't exist"""
    supabase = get_supabase_client()
    
    try:
        # Try to list files in the bucket to check if it exists
        supabase.storage.from_("product-images").list()
        print("✅ Storage bucket 'product-images' exists")
        return True
    except Exception as e:
        if "Bucket not found" in str(e):
            print("❌ Storage bucket 'product-images' not found")
            print("💡 Please create the bucket manually in Supabase dashboard:")
            print("   1. Go to https://app.supabase.com/project/[your-project]/storage/buckets")
            print("   2. Click 'New Bucket'")
            print("   3. Name: 'product-images'")
            print("   4. Make it 'Public bucket' (checked)")
            print("   5. Click 'Save'")
            print("   6. Then restart your backend server")
            return False
        else:
            print(f"❌ Bucket check error: {str(e)}")
            return False

def upload_image(machine_id: str, table_name: str, column_name: str, filename: str, file_data):
    """Upload image to Supabase storage with enhanced error handling"""
    supabase = get_supabase_client()
    
    # Ensure bucket exists
    if not create_storage_bucket_if_not_exists():
        raise Exception("Storage bucket is not available. Please check your Supabase configuration.")
    
    # Create storage path with timestamp for uniqueness
    import time
    timestamp = int(time.time())
    file_path = f"{machine_id}/{table_name}/{column_name}/{timestamp}_{filename}"
    
    try:
        # Upload to Supabase storage with upsert option to handle RLS
        response = supabase.storage.from_("product-images").upload(
            file_path, 
            file_data,
            file_options={"cache-control": "3600", "upsert": "true"}
        )
        
        # Check if upload was successful - Supabase returns different response formats
        print(f"Upload response type: {type(response)}, has data: {hasattr(response, 'data')}")
        
        if response and hasattr(response, 'data'):
            if response.data or response.data is not None:  # Handle both data and None cases
                # Get public URL
                public_url_response = supabase.storage.from_("product-images").get_public_url(file_path)
                print(f"Generated public URL: {public_url_response}")
                return public_url_response
            
        # If we get here, check for errors
        if hasattr(response, 'error') and response.error:
            error_message = str(response.error)
            print(f"Upload error from response: {error_message}")
            raise Exception(f"Upload failed: {error_message}")
        
        # Try to get public URL anyway (sometimes upload succeeds but response is unclear)
        try:
            public_url_response = supabase.storage.from_("product-images").get_public_url(file_path)
            print(f"Fallback - generated public URL: {public_url_response}")
            return public_url_response
        except Exception as url_error:
            print(f"Could not generate public URL: {url_error}")
            raise Exception(f"Upload may have failed or URL generation failed: {response}")
            
    except Exception as e:
        error_str = str(e)
        print(f"Image upload error: {error_str}")
        
        # More specific error messages
        if "Bucket not found" in error_str:
            raise Exception("Storage bucket not found. Please create 'product-images' bucket in Supabase.")
        elif "row-level security" in error_str.lower() or "violates row-level security" in error_str.lower():
            # Try alternative approach if RLS is blocking
            print("RLS detected, attempting direct upload...")
            try:
                # Try to create service role client for bypassing RLS
                from supabase import create_client
                service_client = create_client(SUPABASE_URL, SUPABASE_KEY)
                
                response = service_client.storage.from_("product-images").upload(
                    file_path, 
                    file_data,
                    file_options={"cache-control": "3600", "upsert": "true"}
                )
                
                if hasattr(response, 'data') and response.data:
                    public_url_response = service_client.storage.from_("product-images").get_public_url(file_path)
                    return public_url_response
                else:
                    raise Exception("Service role upload also failed")
                    
            except Exception as service_error:
                print(f"Service role upload error: {service_error}")
                raise Exception("Storage RLS policies are blocking uploads. Please run 'python fix_supabase_storage_rls.py' to get setup instructions.")
        elif "permission" in error_str.lower():
            raise Exception("Permission denied. Please check your Supabase API key permissions.")
        else:
            raise Exception(f"Image upload failed: {error_str}")

def get_image_url(machine_id: str, table_name: str, column_name: str, filename: str):
    """Get public URL for an image"""
    supabase = get_supabase_client()
    
    file_path = f"{machine_id}/{table_name}/{column_name}/{filename}"
    public_url = supabase.storage.from_("product-images").get_public_url(file_path)
    
    return public_url

def delete_image(file_path: str):
    """Delete image from Supabase storage"""
    print(f"DEBUG: delete_image called with file_path: {file_path}")
    supabase = get_supabase_client()

    try:
        print(f"DEBUG: Attempting to delete from Supabase storage: {file_path}")
        response = supabase.storage.from_("product-images").remove([file_path])
        print(f"DEBUG: Supabase delete response: {response}")
        print(f"Successfully deleted image: {file_path}")
        return True
    except Exception as e:
        print(f"ERROR: Failed to delete image {file_path}: {str(e)}")
        import traceback
        print(f"DEBUG: Full traceback: {traceback.format_exc()}")
        return False

def delete_old_product_image(old_image_url: str):
    """Extract file path from image URL and delete the old image"""
    print(f"DEBUG: Attempting to delete old image: {old_image_url}")

    if not old_image_url:
        print("DEBUG: No image URL provided")
        return False

    if '/product-images/' not in old_image_url:
        print(f"DEBUG: URL does not contain '/product-images/': {old_image_url}")
        return False

    try:
        # Extract the file path from the full URL
        # URL format: https://project.supabase.co/storage/v1/object/public/product-images/VM-001/Inventory/product_images/timestamp_filename.ext
        print(f"DEBUG: Splitting URL: {old_image_url}")
        parts = old_image_url.split('/product-images/')
        print(f"DEBUG: URL parts: {parts}")

        if len(parts) > 1:
            file_path = parts[1]  # Get everything after /product-images/
            print(f"DEBUG: Extracted file path: {file_path}")
            result = delete_image(file_path)
            print(f"DEBUG: Delete result: {result}")
            return result
        else:
            print("DEBUG: Could not split URL properly")
            return False
    except Exception as e:
        print(f"ERROR: Exception in delete_old_product_image: {str(e)}")
        return False

def validate_image_file(file_data, max_size_mb=5):
    """Validate image file size and type"""
    import io
    from PIL import Image
    
    # Check file size
    file_size = len(file_data)
    max_size_bytes = max_size_mb * 1024 * 1024
    
    if file_size > max_size_bytes:
        raise Exception(f"File size ({file_size/1024/1024:.1f}MB) exceeds maximum allowed size ({max_size_mb}MB)")
    
    # Validate image format
    try:
        img = Image.open(io.BytesIO(file_data))
        # Convert to RGB if needed (for JPEG compatibility)
        if img.mode in ('RGBA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            
            # Convert back to bytes
            buffer = io.BytesIO()
            rgb_img.save(buffer, format='JPEG', quality=85)
            return buffer.getvalue()
        
        return file_data
        
    except Exception as e:
        raise Exception(f"Invalid image file: {str(e)}")
