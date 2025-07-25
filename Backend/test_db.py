import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def test_database():
    print("🔍 Testing database connection...")
    
    try:
        # Create Supabase client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client created successfully")
        
        # Test orders table structure
        print("\n📊 Testing orders table...")
        try:
            # Try to get table info by selecting from orders table
            response = supabase.table('orders').select('*').limit(1).execute()
            print(f"✅ Orders table exists. Sample data structure: {response.data}")
            
            # Try to understand the actual structure by looking at error messages
            print("\n🔍 Discovering actual table columns...")
            test_columns = ['order_id', 'id', 'machine_id', 'items', 'total_amount', 'payment_status']
            for col in test_columns:
                try:
                    test_response = supabase.table('orders').select(col).limit(1).execute()
                    print(f"✅ Column '{col}' exists")
                except Exception as col_error:
                    print(f"❌ Column '{col}' error: {str(col_error)}")
            
            # Try to insert a test record
            test_order = {
                'machine_id': 'VM-001',
                'items': [{'id': 'test', 'name': 'Test Item', 'price': 1.0, 'quantity': 1}],
                'total_amount': 1.0,
                'payment_status': 'pending'
            }
            
            print(f"\n🧪 Testing insert with data: {test_order}")
            insert_response = supabase.table('orders').insert(test_order).execute()
            print(f"✅ Insert successful: {insert_response.data}")
            
            # Clean up - delete the test record
            if insert_response.data and len(insert_response.data) > 0:
                test_id = insert_response.data[0]['id']
                supabase.table('orders').delete().eq('id', test_id).execute()
                print(f"🧹 Cleaned up test record: {test_id}")
                
        except Exception as e:
            print(f"❌ Orders table error: {str(e)}")
            
            # Try to describe the table structure
            try:
                # Try different approaches to understand the table
                print("\n🔍 Trying to understand table structure...")
                response = supabase.table('orders').select('id').limit(1).execute()
                print(f"Basic select worked: {response}")
            except Exception as e2:
                print(f"❌ Even basic select failed: {str(e2)}")
                print("💡 The orders table might not exist. Please run the setup_supabase_tables.sql script.")
        
        # Test inventory table for comparison
        print("\n📦 Testing inventory table...")
        try:
            inventory_response = supabase.table('inventory').select('*').limit(1).execute()
            print(f"✅ Inventory table works: {inventory_response.data}")
        except Exception as e:
            print(f"❌ Inventory table error: {str(e)}")
            
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")

if __name__ == "__main__":
    test_database()
