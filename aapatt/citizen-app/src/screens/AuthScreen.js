import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { AuthService } from '../services/AuthService';

export default function AuthScreen({ navigation, route }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const { onAuthSuccess } = route.params;

  const handlePhoneAuth = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you would integrate with Firebase Auth
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVerificationId('mock-verification-id');
      setIsCodeSent(true);
      Alert.alert(
        'Verification Code Sent',
        'Please check your phone for the verification code'
      );
    } catch (error) {
      console.error('Phone auth error:', error);
      Alert.alert('Error', 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you would verify with Firebase Auth
      const userData = {
        id: 'user-' + Date.now(),
        phoneNumber: phoneNumber,
        name: 'User',
        userType: 'CITIZEN',
        isVerified: true,
      };

      await AuthService.setUser(userData);
      onAuthSuccess(userData);
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    setVerificationCode('');
    setIsCodeSent(false);
    setVerificationId(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <MaterialIcons name="emergency" size={60} color="#E53935" />
          <Title style={styles.title}>Aapatt</Title>
          <Paragraph style={styles.subtitle}>
            आपत्ति - Emergency Response
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            {!isCodeSent ? (
              <>
                <Title style={styles.cardTitle}>Enter Phone Number</Title>
                <Paragraph style={styles.cardDescription}>
                  We'll send you a verification code to confirm your identity
                </Paragraph>
                
                <TextInput
                  label="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  style={styles.input}
                  left={<TextInput.Icon name="phone" />}
                  placeholder="+91 9876543210"
                />
                
                <Button
                  mode="contained"
                  onPress={handlePhoneAuth}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  Send Verification Code
                </Button>
              </>
            ) : (
              <>
                <Title style={styles.cardTitle}>Enter Verification Code</Title>
                <Paragraph style={styles.cardDescription}>
                  Enter the 6-digit code sent to {phoneNumber}
                </Paragraph>
                
                <TextInput
                  label="Verification Code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  style={styles.input}
                  left={<TextInput.Icon name="key" />}
                  placeholder="123456"
                  maxLength={6}
                />
                
                <Button
                  mode="contained"
                  onPress={handleVerifyCode}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  Verify Code
                </Button>
                
                <Button
                  mode="text"
                  onPress={handleResendCode}
                  style={styles.resendButton}
                >
                  Resend Code
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Paragraph style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Paragraph>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E53935',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resendButton: {
    marginTop: 10,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});