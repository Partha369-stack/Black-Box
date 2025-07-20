# 🔧 Vending Machine System - Connection Configuration

## ✅ **FIXED CONFIGURATION**

### **Backend Server**
- **Port**: `3005`
- **Environment**: `Backend/.env`
- **CORS Origins**: `8000, 8081, 8083` (All frontends now included)
- **WebSocket**: Same port as HTTP (`3005`)

### **Frontend Applications**
| Component | Port | Proxy Target | Environment File |
|-----------|------|--------------|------------------|
| Admin Panel | `8000` | `localhost:3005` | `Admin/.env` |
| VM-001 | `8081` | `localhost:3005` | `VM-001/.env` |
| VM-002 | `8083` | `localhost:3005` | `VM-002/.env` |

### **API Configuration**
- **Base URL**: `http://localhost:3005`
- **WebSocket URL**: `ws://localhost:3005`
- **All components now point to port 3005**

## 🚀 **STARTUP SEQUENCE**

1. **Start Backend**:
   ```bash
   cd Backend
   python index.py
   ```

2. **Start Admin Panel**:
   ```bash
   cd Admin
   npm run dev
   # Runs on http://localhost:8000
   ```

3. **Start VM-001**:
   ```bash
   cd VM-001
   npm run dev
   # Runs on http://localhost:8081
   ```

4. **Start VM-002**:
   ```bash
   cd VM-002
   npm run dev
   # Runs on http://localhost:8083
   ```

## 🔍 **FIXES APPLIED**

✅ **Fixed VM-001 proxy**: `4001` → `3005`
✅ **Added VM-002 to CORS**: Added port `8083`
✅ **Created all .env files**: Unified configuration
✅ **Fixed WebSocket URLs**: All point to `localhost:3005`
✅ **Standardized API URLs**: All components use same backend

## 🧪 **TESTING CHECKLIST**

- [ ] Backend starts on port 3005
- [ ] Admin Panel connects to backend API
- [ ] VM-001 connects to backend API
- [ ] VM-002 connects to backend API (no CORS errors)
- [ ] WebSocket connections work across all components
- [ ] All API calls return successful responses