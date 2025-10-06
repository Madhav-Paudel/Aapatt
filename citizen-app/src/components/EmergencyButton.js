/**
 * Emergency Button Component
 * Large, accessible button for emergency requests
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

const EmergencyButton = ({ type, icon, onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={() => onPress(type)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{type}</Text>
      <Text style={styles.hint}>Tap for emergency</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E53935',
    borderRadius: 16,
    padding: 24,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  disabled: {
    backgroundColor: '#BDBDBD',
    opacity: 0.6,
  },
  icon: {
    fontSize: 64,
    marginBottom: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  hint: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
    textAlign: 'center',
  },
});

export default EmergencyButton;
