import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#E53935',      // Emergency Red
    secondary: '#1565C0',    // Trust Blue
    accent: '#FFEB3B',       // Alert Yellow
    success: '#43A047',      // Safe Green
    warning: '#FF9800',      // Warning Orange
    danger: '#F44336',       // Danger Red
    info: '#2196F3',         // Info Blue
    surface: '#FFFFFF',      // White
    background: '#F5F5F5',   // Light Gray
    text: '#212121',         // Dark Gray
    placeholder: '#757575',  // Medium Gray
    disabled: '#BDBDBD',     // Light Gray
    error: '#F44336',        // Error Red
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