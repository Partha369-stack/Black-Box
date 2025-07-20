import os
from pathlib import Path
from supabase import create_client, Client

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def get_supabase_client() -> Client:
    url = SUPABASE_URL
    key = SUPABASE_KEY
    return create_client(url, key)

def get_inventory(machine_id: str):
    supabase = get_supabase_client()
    response = supabase.table('inventory').select('*').eq('machine_id', machine_id).execute()
    return response.data

def add_inventory(machine_id: str, item: dict):
    supabase = get_supabase_client()
    response = supabase.table('inventory').insert({'machine_id': machine_id, **item}).execute()
    return response.data

def update_inventory(machine_id: str, item_id: str, updates: dict):
    supabase = get_supabase_client()
    response = supabase.table('inventory').update(updates).eq('machine_id', machine_id).eq('id', item_id).execute()
    return response.data

def delete_inventory_item(machine_id: str, item_id: str):
    supabase = get_supabase_client()
    response = supabase.table('inventory').delete().eq('machine_id', machine_id).eq('id', item_id).execute()
    return response.data

def get_orders(machine_id: str):
    supabase = get_supabase_client()
    response = supabase.table('orders').select('*').eq('machine_id', machine_id).execute()
    return response.data

def add_order(machine_id: str, order: dict):
    supabase = get_supabase_client()
    response = supabase.table('orders').insert({'machine_id': machine_id, **order}).execute()
    return response.data

def get_order(machine_id: str, order_id: str):
    supabase = get_supabase_client()
    response = supabase.table('orders').select('*').eq('machine_id', machine_id).eq('id', order_id).execute()
    return response.data

def update_order(machine_id: str, order_id: str, updates: dict):
    supabase = get_supabase_client()
    response = supabase.table('orders').update(updates).eq('machine_id', machine_id).eq('id', order_id).execute()
    return response.data

def upload_image(machine_id: str, table_name: str, column_name: str, filename: str, file_data):
    """Upload image to Supabase storage"""
    supabase = get_supabase_client()
    
    # Create storage path
    file_path = f"{machine_id}/{table_name}/{column_name}/{filename}"
    
    # Upload to Supabase storage
    response = supabase.storage.from_("product-images").upload(file_path, file_data)
    
    if response.status_code == 200:
        # Get public URL
        public_url = supabase.storage.from_("product-images").get_public_url(file_path)
        return public_url
    else:
        raise Exception(f"Failed to upload image: {response.status_code}")

def get_image_url(machine_id: str, table_name: str, column_name: str, filename: str):
    """Get public URL for an image"""
    supabase = get_supabase_client()
    
    file_path = f"{machine_id}/{table_name}/{column_name}/{filename}"
    public_url = supabase.storage.from_("product-images").get_public_url(file_path)
    
    return public_url