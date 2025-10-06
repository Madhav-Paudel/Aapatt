/**
 * Register Screen
 * User registration screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await register(phone, name);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.error || 'Unable to register');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register to use Aapatt emergency services</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 1234567890"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 8,
    alignItems: 'center',
  },
  linkText: {
    color: '#1565C0',
    fontSize: 14,
  },
});

export default RegisterScreen;
