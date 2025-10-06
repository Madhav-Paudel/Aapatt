import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  TextInput, 
  ActivityIndicator 
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { sendOTP, verifyOTP, checkAuthToken } from '../services/api';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    checkExistingAuth();
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const checkExistingAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const isValid = await checkAuthToken(token);
        if (isValid) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const formatPhoneNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.length > 0 && !cleaned.startsWith('91')) {
      return '+91' + cleaned;
    }
    
    return '+' + cleaned;
  };

  const handleSendOTP = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    if (formattedPhone.length < 13) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(formattedPhone);
      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown
      Alert.alert(
        'OTP Sent',
        `A verification code has been sent to ${formattedPhone}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phone);
      const response = await verifyOTP(formattedPhone, otp);
      
      // Store auth token
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userProfile', JSON.stringify(response.user));
      
      Alert.alert(
        'Welcome to Aapatt!',
        'Login successful. You can now request emergency services.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    setCountdown(0);
    handleSendOTP();
  };

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* App Header */}
        <View style={styles.header}>
          <Text style={styles.appIcon}>🚨</Text>
          <Text style={styles.appName}>Aapatt</Text>
          <Text style={styles.appTagline}>Emergency Response System</Text>
        </View>

        {/* Login Card */}
        <Card style={styles.loginCard}>
          <Card.Content>
            <Title style={styles.loginTitle}>
              {otpSent ? 'Verify OTP' : 'Login with Phone'}
            </Title>
            
            {!otpSent ? (
              <>
                <Paragraph style={styles.loginDescription}>
                  Enter your phone number to receive a verification code
                </Paragraph>
                
                <TextInput
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 98765 43210"
                  keyboardType="phone-pad"
                  style={styles.input}
                  left={<TextInput.Icon icon="phone" />}
                  autoComplete="tel"
                />
                
                <Button
                  mode="contained"
                  onPress={handleSendOTP}
                  loading={loading}
                  disabled={loading}
                  style={styles.loginButton}
                  icon="send"
                >
                  Send OTP
                </Button>
              </>
            ) : (
              <>
                <Paragraph style={styles.loginDescription}>
                  Enter the 6-digit code sent to {formatPhoneNumber(phone)}
                </Paragraph>
                
                <TextInput
                  label="OTP Code"
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="123456"
                  keyboardType="numeric"
                  maxLength={6}
                  style={styles.input}
                  left={<TextInput.Icon icon="key" />}
                  autoComplete="sms-otp"
                />
                
                <Button
                  mode="contained"
                  onPress={handleVerifyOTP}
                  loading={loading}
                  disabled={loading || otp.length !== 6}
                  style={styles.loginButton}
                  icon="check"
                >
                  Verify & Login
                </Button>
                
                <View style={styles.resendContainer}>
                  {countdown > 0 ? (
                    <Text style={styles.countdownText}>
                      Resend OTP in {countdown} seconds
                    </Text>
                  ) : (
                    <Button
                      mode="text"
                      onPress={handleResendOTP}
                      disabled={loading}
                    >
                      Resend OTP
                    </Button>
                  )}
                </View>
                
                <Button
                  mode="text"
                  onPress={() => {
                    setOtpSent(false);
                    setOtp('');
                    setCountdown(0);
                  }}
                  style={styles.changeNumberButton}
                >
                  Change Phone Number
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Emergency Notice */}
        <Card style={styles.emergencyCard}>
          <Card.Content>
            <View style={styles.emergencyHeader}>
              <Text style={styles.emergencyIcon}>⚠️</Text>
              <Title style={styles.emergencyTitle}>Emergency Notice</Title>
            </View>
            <Paragraph style={styles.emergencyText}>
              In case of immediate life-threatening emergency, 
              call 112 (Emergency) or 102 (Ambulance) directly.
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Features */}
        <Card style={styles.featuresCard}>
          <Card.Content>
            <Title>Why Choose Aapatt?</Title>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🚑</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Instant Emergency Response</Text>
                <Text style={styles.featureDescription}>
                  Connect with nearest ambulance, fire brigade, or air ambulance
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📍</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Real-time Tracking</Text>
                <Text style={styles.featureDescription}>
                  Track emergency responders in real-time with live ETA updates
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤖</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>AI First-Aid Assistant</Text>
                <Text style={styles.featureDescription}>
                  Get instant AI-powered first-aid guidance with camera analysis
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 32,
  },
  appIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#666',
  },
  loginCard: {
    elevation: 4,
    marginBottom: 16,
  },
  loginTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#E53935',
  },
  loginDescription: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#E53935',
    marginBottom: 8,
  },
  resendContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  countdownText: {
    fontSize: 14,
    color: '#666',
  },
  changeNumberButton: {
    marginTop: 8,
  },
  emergencyCard: {
    elevation: 4,
    marginBottom: 16,
    backgroundColor: '#fff3e0',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  emergencyTitle: {
    color: '#e65100',
    fontSize: 18,
  },
  emergencyText: {
    color: '#e65100',
    fontSize: 14,
  },
  featuresCard: {
    elevation: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 4,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default LoginScreen;