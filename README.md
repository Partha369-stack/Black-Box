# Black Box - IoT Smart Vending Machine

A comprehensive smart vending machine system with React-based interfaces and automated order management.

## 🏗️ Project Structure

```
Black-Box/
├── Admin/          # Admin dashboard for order management
├── Backend/         # Express.js API server  
├── VM-001/          # Customer interface for Machine 1
├── VM-002/          # Customer interface for Machine 2
└── Black_Box/       # Landing page
```

## 🎯 Key Features

### Admin Dashboard
- **Read-only order management** - View, filter, search orders
- **Order export** - CSV export functionality
- **Receipt generation** - Download order receipts
- **Real-time inventory tracking**
- **Multi-machine support** (VM-001, VM-002)

### Customer Interface (VM-001 & VM-002)
- **Product catalog** with real-time inventory
- **Shopping cart** functionality
- **Customer information collection**
- **QR code payment** via Razorpay UPI
- **Automatic order cancellation** workflow

### Backend API
- **Multi-tenant architecture** (separate data per machine)
- **Order management** with automatic inventory updates
- **Payment processing** via Razorpay webhooks
- **RESTful API** for all operations

## 🔄 Customer Order Workflow

### Standard Order Flow:
1. Customer selects products → adds to cart
2. Customer clicks "Checkout" → Customer info modal opens
3. Customer fills details → clicks "Continue to Payment" 
4. **Order is created** → QR code displayed for payment
5. Customer scans QR → pays via UPI → order completed

### ⚠️ Auto-Cancellation Workflow:
**When customer clicks "X" (close button) during payment phase:**

```
Customer clicks "X" on payment modal
↓
PaymentModal.handleClose() triggered
↓
Checks: orderId exists && payment not successful
↓
Sends POST to /api/orders/{orderId}/cancel
↓
Backend cancels order + restores inventory
↓
Page refreshes → cart cleared → customer can start fresh
```

**Implementation Details:**
- **VM-001**: Auto-cancellation in `PaymentModal.tsx` (lines 151-179)
- **VM-002**: Auto-cancellation in `PaymentModal.tsx` (lines 102-131)
- **Backend**: Cancel endpoint at `/api/orders/{orderId}/cancel`
- **Result**: Inventory automatically restored, no manual intervention needed

## 🛠️ Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Payment**: Razorpay UPI QR codes
- **State Management**: React hooks, Context API
- **UI Components**: Custom component library
- **Deployment**: Railway (Backend), Vercel (Frontend)

## 🚀 Deployment

- **Live Demo**: [blackbox-sandy.vercel.app](https://blackbox-sandy.vercel.app)
- **Backend API**: Deployed on Railway
- **Frontend**: Multi-deployment (Admin, VM-001, VM-002 on Vercel)

## 🔧 Environment Setup

### Backend (.env)
```
PORT=3000
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### Frontend (.env)
```
VITE_API_KEY=blackbox-api-key-2024
VITE_BACKEND_URL=https://your-backend-url
```

## 📱 Machine IDs

- **VM-001**: Vending Machine 1
- **VM-002**: Vending Machine 2
- **Admin**: Cross-machine management

Each machine operates independently with separate inventory and order tracking.

## 🔐 Security Features

- **API Key authentication**
- **Tenant isolation** (X-Tenant-ID headers)
- **Payment webhook verification**
- **CORS protection**
- **Input validation**

## 📈 Order Management

### Admin Capabilities:
- ✅ View all orders across machines
- ✅ Filter by status, date, customer
- ✅ Export order data (CSV)
- ✅ Download individual receipts
- ❌ Cancel orders (removed for security)

### Automatic Processes:
- ✅ Inventory updates on successful payment
- ✅ Order cancellation on customer exit
- ✅ QR code expiration (3 minutes)
- ✅ Payment verification via webhooks

---

**Developed by**: Partha369-stack  
**Repository**: [GitHub - Black Box](https://github.com/Partha369-stack/Black-Box)  
**License**: MIT
