/**
 * Aapatt Emergency Button Component
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { theme, emergencyStyles } from '../theme/theme';

export default function EmergencyButton({ 
  type, 
  emergency, 
  onPress, 
  availableProviders = 0, 
  disabled = false 
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        emergencyStyles.emergencyButton,
        disabled && styles.disabled
      ]}
      onPress={() => onPress(type)}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{emergency.icon}</Text>
      <Text style={styles.name}>{emergency.name}</Text>
      <Text style={styles.description}>{emergency.description}</Text>
      <View style={styles.availabilityContainer}>
        <Text style={styles.availability}>
          {availableProviders} Available
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '48%',
    aspectRatio: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  name: {
    ...emergencyStyles.emergencyText,
    fontSize: 16,
    marginBottom: theme.spacing.xs,
  },
  description: {
    color: theme.colors.onPrimary,
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: theme.spacing.sm,
  },
  availabilityContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  availability: {
    color: theme.colors.onPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
});