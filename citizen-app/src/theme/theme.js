/**
 * Aapatt Emergency Superapp - Theme Configuration
 * Material Design 3 theme with emergency-focused colors
 */

import { MD3LightTheme } from 'react-native-paper';
import { COLORS } from '@aapatt/shared';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary colors (Emergency Red)
    primary: COLORS.PRIMARY_RED,
    onPrimary: COLORS.WHITE,
    primaryContainer: '#FFEBEE',
    onPrimaryContainer: '#B71C1C',
    
    // Secondary colors (Trust Blue)  
    secondary: COLORS.SECONDARY_BLUE,
    onSecondary: COLORS.WHITE,
    secondaryContainer: '#E3F2FD',
    onSecondaryContainer: '#0D47A1',
    
    // Tertiary colors (Alert Yellow)
    tertiary: COLORS.ACCENT_YELLOW,
    onTertiary: COLORS.BLACK,
    tertiaryContainer: '#FFF9C4',
    onTertiaryContainer: '#F57F17',
    
    // Error colors
    error: COLORS.PRIMARY_RED,
    onError: COLORS.WHITE,
    errorContainer: '#FFEBEE',
    onErrorContainer: '#B71C1C',
    
    // Success colors
    success: COLORS.SUCCESS_GREEN,
    onSuccess: COLORS.WHITE,
    successContainer: '#E8F5E8',
    onSuccessContainer: '#1B5E20',
    
    // Warning colors
    warning: '#FF9800',
    onWarning: COLORS.WHITE,
    warningContainer: '#FFF3E0',
    onWarningContainer: '#E65100',
    
    // Surface colors
    background: COLORS.WHITE,
    onBackground: COLORS.BLACK,
    surface: COLORS.WHITE,
    onSurface: COLORS.BLACK,
    surfaceVariant: COLORS.GRAY_LIGHT,
    onSurfaceVariant: COLORS.GRAY_DARK,
    
    // Outline colors
    outline: COLORS.GRAY_MEDIUM,
    outlineVariant: COLORS.GRAY_LIGHT,
    
    // Inverse colors
    inverseSurface: COLORS.GRAY_DARK,
    inverseOnSurface: COLORS.WHITE,
    inversePrimary: '#FF8A80',
    
    // Shadow and elevation
    shadow: COLORS.BLACK,
    scrim: COLORS.OVERLAY,
    
    // Custom emergency colors
    emergency: COLORS.EMERGENCY,
    emergencyContainer: COLORS.EMERGENCY_OVERLAY,
  },
  
  // Typography
  fonts: {
    ...MD3LightTheme.fonts,
    displayLarge: {
      fontFamily: 'Inter-Bold',
      fontSize: 57,
      fontWeight: '400',
      lineHeight: 64,
      letterSpacing: 0,
    },
    displayMedium: {
      fontFamily: 'Inter-Bold',
      fontSize: 45,
      fontWeight: '400',
      lineHeight: 52,
      letterSpacing: 0,
    },
    displaySmall: {
      fontFamily: 'Inter-Bold',
      fontSize: 36,
      fontWeight: '400',
      lineHeight: 44,
      letterSpacing: 0,
    },
    headlineLarge: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 32,
      fontWeight: '400',
      lineHeight: 40,
      letterSpacing: 0,
    },
    headlineMedium: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 28,
      fontWeight: '400',
      lineHeight: 36,
      letterSpacing: 0,
    },
    headlineSmall: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 24,
      fontWeight: '400',
      lineHeight: 32,
      letterSpacing: 0,
    },
    titleLarge: {
      fontFamily: 'Inter-Medium',
      fontSize: 22,
      fontWeight: '400',
      lineHeight: 28,
      letterSpacing: 0,
    },
    titleMedium: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    titleSmall: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    bodyLarge: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    bodyMedium: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    bodySmall: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0.4,
    },
    labelLarge: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    labelMedium: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontFamily: 'Inter-Medium',
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.5,
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 9999,
  },
  
  // Elevation
  elevation: {
    level0: 0,
    level1: 1,
    level2: 3,
    level3: 6,
    level4: 8,
    level5: 12,
  },
  
  // Animation durations
  animation: {
    scale: 100,
    fade: 200,
    slide: 300,
  },
};

// Emergency-specific styles
export const emergencyStyles = {
  emergencyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    elevation: theme.elevation.level3,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  emergencyButtonPressed: {
    backgroundColor: '#C62828',
    elevation: theme.elevation.level1,
    transform: [{ scale: 0.98 }],
  },
  
  emergencyText: {
    color: theme.colors.onPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  
  statusOnline: {
    backgroundColor: theme.colors.success,
  },
  
  statusOffline: {
    backgroundColor: theme.colors.outline,
  },
  
  statusBusy: {
    backgroundColor: theme.colors.warning,
  },
  
  mapContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  
  floatingButton: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    elevation: theme.elevation.level4,
  },
  
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.sm,
    elevation: theme.elevation.level2,
  },
  
  emergencyCard: {
    backgroundColor: theme.colors.errorContainer,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  
  successCard: {
    backgroundColor: theme.colors.successContainer,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  
  warningCard: {
    backgroundColor: theme.colors.warningContainer,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
};

export default theme;