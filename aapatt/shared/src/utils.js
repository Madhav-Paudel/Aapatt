// Utility Functions

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Format as +XX XXX XXX XXXX for international numbers
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }

  // Return as-is for other formats
  return phone;
};

// Validate phone number
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Check for valid length (10-15 digits for international format)
  return cleaned.length >= 10 && cleaned.length <= 15;
};

// Format timestamp
export const formatTimestamp = (timestamp, format = 'short') => {
  if (!timestamp) return '';

  const date = new Date(timestamp);

  if (format === 'short') {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (format === 'long') {
    return date.toLocaleString();
  }

  if (format === 'time') {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (format === 'date') {
    return date.toLocaleDateString();
  }

  return date.toISOString();
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Convert degrees to radians
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Calculate estimated time of arrival
export const calculateETA = (distance, averageSpeed = 30) => {
  // Average speed in km/h for emergency vehicles
  const timeInHours = distance / averageSpeed;
  const etaInMinutes = Math.ceil(timeInHours * 60);

  return {
    distance: Math.round(distance * 10) / 10, // Round to 1 decimal
    eta: etaInMinutes,
    unit: 'minutes'
  };
};

// Format distance
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// Format duration
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Get emergency type icon
export const getEmergencyIcon = (type) => {
  const icons = {
    MEDICAL: 'medical',
    FIRE: 'flame',
    ACCIDENT: 'car',
    AIR_EMERGENCY: 'airplane',
    SECURITY: 'shield',
    OTHER: 'alert-circle',
  };
  return icons[type] || 'alert-circle';
};

// Get emergency type color
export const getEmergencyColor = (type) => {
  const colors = {
    MEDICAL: '#E53935',
    FIRE: '#FF5722',
    ACCIDENT: '#2196F3',
    AIR_EMERGENCY: '#9C27B0',
    SECURITY: '#FF9800',
    OTHER: '#607D8B',
  };
  return colors[type] || '#607D8B';
};

// Get priority color
export const getPriorityColor = (priority) => {
  const colors = {
    LOW: '#43A047',
    MEDIUM: '#FF9800',
    HIGH: '#F44336',
    CRITICAL: '#D32F2F',
  };
  return colors[priority] || '#607D8B';
};

// Check if emergency is active
export const isEmergencyActive = (status) => {
  const activeStatuses = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE'];
  return activeStatuses.includes(status);
};

// Get status description
export const getStatusDescription = (status) => {
  const descriptions = {
    PENDING: 'Waiting for provider',
    ASSIGNED: 'Assigned to provider',
    ACCEPTED: 'Provider en route',
    EN_ROUTE: 'Provider on the way',
    ARRIVED: 'Provider has arrived',
    COMPLETED: 'Emergency resolved',
    CANCELLED: 'Request cancelled',
    EXPIRED: 'Request expired',
  };
  return descriptions[status] || status;
};

// Sleep function
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));

  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
};

// Check if value is empty
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';

  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate random color
export const getRandomColor = () => {
  const colors = [
    '#E53935', '#D32F2F', '#C62828',
    '#1565C0', '#1976D2', '#1565C0',
    '#43A047', '#388E3C', '#2E7D32',
    '#FF9800', '#F57C00', '#E65100',
    '#9C27B0', '#7B1FA2', '#6A1B9A',
  ];

  return colors[Math.floor(Math.random() * colors.length)];
};

// Check if device is online
export const isOnline = () => {
  return navigator.onLine;
};

// Listen for online/offline events
export const onNetworkChange = (callback) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));

    return () => {
      window.removeEventListener('online', () => callback(true));
      window.removeEventListener('offline', () => callback(false));
    };
  }
};