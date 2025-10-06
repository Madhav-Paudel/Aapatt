const admin = require('firebase-admin');

let firebaseApp = null;

const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      console.log('🔥 Firebase Admin initialized successfully');
    } else {
      firebaseApp = admin.app();
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    // Continue without Firebase for development
  }
};

const sendOTP = async (phoneNumber) => {
  try {
    if (!firebaseApp) {
      // Mock OTP for development
      console.log(`📱 Mock OTP for ${phoneNumber}: 123456`);
      return { success: true, otp: '123456' };
    }

    // In production, you would use Firebase Auth to send OTP
    // For now, we'll return a mock OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
    
    return { success: true, otp };
  } catch (error) {
    console.error('❌ OTP send failed:', error.message);
    throw new Error('Failed to send OTP');
  }
};

const verifyOTP = async (phoneNumber, otp) => {
  try {
    if (!firebaseApp) {
      // Mock verification for development
      return { success: true, valid: otp === '123456' };
    }

    // In production, verify OTP with Firebase Auth
    // For now, we'll do mock verification
    const isValid = otp === '123456' || otp.length === 6;
    
    return { success: true, valid: isValid };
  } catch (error) {
    console.error('❌ OTP verification failed:', error.message);
    throw new Error('Failed to verify OTP');
  }
};

const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    if (!firebaseApp) {
      console.log(`📱 Mock notification to ${token}: ${title} - ${body}`);
      return { success: true };
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      token
    };

    const response = await admin.messaging().send(message);
    console.log('📱 Push notification sent:', response);
    
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Push notification failed:', error.message);
    return { success: false, error: error.message };
  }
};

const sendMulticastNotification = async (tokens, title, body, data = {}) => {
  try {
    if (!firebaseApp) {
      console.log(`📱 Mock multicast notification to ${tokens.length} devices: ${title} - ${body}`);
      return { success: true };
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('📱 Multicast notification sent:', response);
    
    return { 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('❌ Multicast notification failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeFirebase,
  sendOTP,
  verifyOTP,
  sendPushNotification,
  sendMulticastNotification
};