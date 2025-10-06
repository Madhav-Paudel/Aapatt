import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Import services
import { authService } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Check if already authenticated
    checkAuthStatus();
  }, []);

  useEffect(() => {
    // Countdown timer for OTP resend
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const checkAuthStatus = async () => {
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const handleSendOTP = async () => {
    try {
      if (!phoneNumber.trim()) {
        Alert.alert('Error', 'Please enter your phone number');
        return;
      }

      setIsLoading(true);

      await authService.sendOTP(phoneNumber.trim());

      setStep('otp');
      setCountdown(60); // 60 seconds countdown

      Alert.alert(
        'OTP Sent',
        `A verification code has been sent to ${authService.formatPhoneNumber(phoneNumber)}`
      );
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (!otp.trim()) {
        Alert.alert('Error', 'Please enter the verification code');
        return;
      }

      setIsLoading(true);

      await authService.verifyOTP(phoneNumber.trim(), otp.trim());

      Alert.alert('Success', 'Login successful!', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Main'),
        },
      ]);
    } catch (error) {
      console.error('Verify OTP error:', error);
      Alert.alert('Error', error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      setIsLoading(true);
      await authService.sendOTP(phoneNumber.trim());
      setCountdown(60);

      Alert.alert('OTP Sent', 'A new verification code has been sent');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setCountdown(0);
  };

  const formatPhoneNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX for US numbers
    if (cleaned.length <= 10) {
      let formatted = cleaned;
      if (formatted.length >= 6) {
        formatted = `(${formatted.slice(0, 3)}) ${formatted.slice(3, 6)}-${formatted.slice(6)}`;
      } else if (formatted.length >= 3) {
        formatted = `(${formatted.slice(0, 3)}) ${formatted.slice(3)}`;
      }
      setPhoneNumber(formatted);
    }
  };

  const renderPhoneStep = () => (
    <>
      <Text style={styles.title}>Welcome to Aapatt</Text>
      <Text style={styles.subtitle}>Emergency Services at Your Fingertips</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="call" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#999"
          value={phoneNumber}
          onChangeText={formatPhoneNumber}
          keyboardType="phone-pad"
          maxLength={14}
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSendOTP}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.buttonText}>Send Verification Code</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.termsText}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </>
  );

  const renderOTPStep = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={handleBackToPhone}>
        <Ionicons name="arrow-back" size={24} color="#E53935" />
      </TouchableOpacity>

      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to{'\n'}
        {authService.formatPhoneNumber(phoneNumber)}
      </Text>

      <View style={styles.otpContainer}>
        <TextInput
          style={styles.otpInput}
          placeholder="000000"
          placeholderTextColor="#999"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleVerifyOTP}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.buttonText}>Verify & Continue</Text>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.resendButton, countdown > 0 && styles.resendButtonDisabled]}
        onPress={handleResendOTP}
        disabled={countdown > 0}
      >
        <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#E53935', '#C62828']}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <Ionicons name="medical" size={60} color="#FFFFFF" />
          <Text style={styles.logoText}>आपत्ति</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {step === 'phone' ? renderPhoneStep() : renderOTPStep()}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Emergency? Call 911 directly
        </Text>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => Linking.openURL('tel:911')}
        >
          <Ionicons name="call" size={20} color="#E53935" />
          <Text style={styles.emergencyText}>911</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  otpInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    letterSpacing: 4,
  },
  button: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 16,
    zIndex: 1,
  },
  resendButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: '#999',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E53935',
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
    marginLeft: 8,
  },
});