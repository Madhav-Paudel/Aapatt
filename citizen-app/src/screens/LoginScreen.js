/**
 * Login Screen
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { useAuth } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    try {
      setIsLoading(true);
      await login(phoneNumber);
      navigation.navigate('OTP', { phoneNumber });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Aapatt</Text>
          <Text style={styles.subtitle}>आपत्ति</Text>
          <Text style={styles.tagline}>Emergency services at your fingertips</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Sign In</Text>
            
            <TextInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              mode="outlined"
              keyboardType="phone-pad"
              placeholder="+91 98765 43210"
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              Send OTP
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.textButton}
            >
              Don't have an account? Register
            </Button>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 24,
    color: theme.colors.onPrimary,
    opacity: 0.9,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.onPrimary,
    opacity: 0.8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    elevation: theme.elevation.level3,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    color: theme.colors.onSurface,
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  button: {
    marginBottom: theme.spacing.md,
  },
  textButton: {
    marginTop: theme.spacing.sm,
  },
});