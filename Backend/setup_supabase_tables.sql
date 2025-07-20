-- BLACK_BOX IoT Vending Machine System - Supabase Database Schema
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100),
    slot VARCHAR(20),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id VARCHAR(50) NOT NULL,
    order_number VARCHAR(100),
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_details JSONB,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_machine_id ON inventory(machine_id);
CREATE INDEX IF NOT EXISTS idx_orders_machine_id ON orders(machine_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to both tables
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at 
    BEFORE UPDATE ON inventory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at_column();

-- Insert some sample data for testing (optional)
-- INSERT INTO inventory (machine_id, name, price, quantity, category, slot) VALUES
-- ('VM-001', 'Coca Cola', 2.50, 10, 'Beverages', 'A1'),
-- ('VM-001', 'Pepsi', 2.50, 10, 'Beverages', 'A2'),
-- ('VM-001', 'Water', 1.50, 15, 'Beverages', 'A3'),
-- ('VM-002', 'Coca Cola', 2.50, 8, 'Beverages', 'A1'),
-- ('VM-002', 'Pepsi', 2.50, 8, 'Beverages', 'A2');

-- Grant necessary permissions (adjust as needed for your security setup)
-- ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for product images (run this separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
