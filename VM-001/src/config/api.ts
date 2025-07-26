// API Configuration for VM-001
export const API_CONFIG = {
  BASE_URL: 'https://black-box-production.up.railway.app',
  ENDPOINTS: {
    HEALTH: '/api/health',
    INVENTORY: '/api/inventory',
    ORDERS: '/api/orders',
    DEBUG_RAZORPAY: '/debug/razorpay',
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'VM-001',
  },
  RAZORPAY: {
    KEY_ID: 'rzp_test_03GDDKe1yQVSCT',
  },
  WEBSOCKET: {
    URL: 'wss://black-box-production.up.railway.app',
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If relative path, prepend base URL
  if (imagePath.startsWith('/')) {
    return `${API_CONFIG.BASE_URL}${imagePath}`;
  }
  
  return imagePath;
};
