import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#E53935',        // Emergency Red
    secondary: '#1565C0',      // Trust Blue
    accent: '#FFEB3B',         // Alert Yellow
    success: '#43A047',        // Safe Green
    warning: '#FF9800',        // Warning Orange
    danger: '#D32F2F',         // Danger Red
    info: '#2196F3',           // Info Blue
    surface: '#FFFFFF',
    background: '#F5F5F5',
    text: '#212121',
    placeholder: '#757575',
    disabled: '#BDBDBD',
    error: '#D32F2F',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
  roundness: 12,
};

export const colors = {
  primary: '#E53935',
  secondary: '#1565C0',
  accent: '#FFEB3B',
  success: '#43A047',
  warning: '#FF9800',
  danger: '#D32F2F',
  info: '#2196F3',
  light: '#F5F5F5',
  dark: '#212121',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#757575',
  lightGray: '#BDBDBD',
};

export const serviceColors = {
  AMBULANCE: '#E53935',
  FIRE_BRIGADE: '#FF5722',
  AIR_AMBULANCE: '#9C27B0',
  POLICE: '#3F51B5',
  SECURITY: '#607D8B',
};

export const statusColors = {
  PENDING: '#FF9800',
  ACCEPTED: '#2196F3',
  EN_ROUTE: '#1565C0',
  ARRIVED: '#43A047',
  COMPLETED: '#43A047',
  CANCELLED: '#D32F2F',
  EXPIRED: '#757575',
};

export const priorityColors = {
  LOW: '#43A047',
  MEDIUM: '#FF9800',
  HIGH: '#D32F2F',
  CRITICAL: '#E53935',
};

export const severityColors = {
  MINOR: '#43A047',
  MODERATE: '#FF9800',
  SEVERE: '#D32F2F',
  CRITICAL: '#E53935',
  FATAL: '#000000',
};