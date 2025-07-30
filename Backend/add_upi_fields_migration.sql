-- Migration to add UPI payment fields to orders table
-- Run this in your Supabase SQL Editor to add UPI payment support

-- Add UPI payment fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'razorpay';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vpa VARCHAR(255); -- Virtual Payment Address (UPI ID)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payer_account_type VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS upi_transaction_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS qr_code_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_vpa ON orders(vpa);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_qr_code_id ON orders(qr_code_id);

-- Update existing orders to set default payment_method
UPDATE orders SET payment_method = 'razorpay' WHERE payment_method IS NULL;

-- Add comment to table for documentation
COMMENT ON COLUMN orders.payment_id IS 'Razorpay payment ID';
COMMENT ON COLUMN orders.payment_method IS 'Payment method used (razorpay, upi, cash, etc.)';
COMMENT ON COLUMN orders.vpa IS 'Virtual Payment Address (UPI ID) of the payer';
COMMENT ON COLUMN orders.payer_account_type IS 'Type of UPI account used for payment';
COMMENT ON COLUMN orders.bank_name IS 'Bank name from UPI transaction';
COMMENT ON COLUMN orders.upi_transaction_id IS 'UPI transaction reference ID';
COMMENT ON COLUMN orders.razorpay_order_id IS 'Razorpay order ID for tracking';
COMMENT ON COLUMN orders.qr_code_id IS 'Razorpay QR code ID for this order';
COMMENT ON COLUMN orders.payment_amount IS 'Actual amount paid (might differ from total_amount for partial payments)';

-- Create a view for easier querying of order details with payment info
CREATE OR REPLACE VIEW order_details_view AS
SELECT 
    o.*,
    CASE 
        WHEN o.payment_status = 'paid' AND o.vpa IS NOT NULL THEN 'UPI Payment'
        WHEN o.payment_status = 'paid' THEN 'Payment Completed'
        WHEN o.payment_status = 'pending' THEN 'Payment Pending'
        WHEN o.payment_status = 'cancelled' THEN 'Order Cancelled'
        ELSE 'Unknown Status'
    END as status_description,
    CASE 
        WHEN o.vpa IS NOT NULL THEN CONCAT('UPI: ', o.vpa)
        WHEN o.payment_method IS NOT NULL THEN UPPER(o.payment_method)
        ELSE 'N/A'
    END as payment_info,
    -- Calculate order age in minutes
    EXTRACT(EPOCH FROM (NOW() - o.created_at)) / 60 as order_age_minutes
FROM orders o;

-- Grant permissions for the view
GRANT SELECT ON order_details_view TO authenticated;

-- Sample data update for testing (optional)
-- UPDATE orders SET 
--     payment_method = 'razorpay',
--     vpa = 'test@okaxis',
--     bank_name = 'Test Bank',
--     payer_account_type = 'SAVINGS'
-- WHERE payment_status = 'paid' AND payment_method IS NULL;

COMMENT ON TABLE orders IS 'Orders table with UPI payment support - Updated with UPI fields for admin interface';
