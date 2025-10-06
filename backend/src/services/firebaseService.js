const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
let firebaseApp;

const initializeFirebase = () => {
  try {
    // Check if Firebase app is already initialized
    if (firebaseApp) {
      return firebaseApp;
    }

    // Firebase service account configuration
    const serviceAccount = {
      "type": "service_account",
      "project_id": process.env.FIREBASE_PROJECT_ID || "aapatt-emergency",
      "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
      "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      "client_email": process.env.FIREBASE_CLIENT_EMAIL,
      "client_id": process.env.FIREBASE_CLIENT_ID,
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": process.env.FIREBASE_CERT_URL
    };

    // Initialize Firebase Admin SDK
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'aapatt-emergency'}.firebaseio.com`,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID || 'aapatt-emergency'}.appspot.com`
    });

    console.log('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Error initializing Firebase:', error.message);
    // Return a mock object for development
    return {
      auth: () => ({
        verifyIdToken: async () => ({ uid: 'dev-user' }),
        createCustomToken: async () => 'dev-token',
        getUserByPhoneNumber: async () => ({ uid: 'dev-user' }),
        createUser: async () => ({ uid: 'dev-user' }),
        updateUser: async () => ({ uid: 'dev-user' })
      }),
      messaging: () => ({
        send: async () => ({ messageId: 'dev-message' }),
        sendMulticast: async () => ({ successCount: 1, failureCount: 0 })
      })
    };
  }
};

// Firebase Authentication Services
class FirebaseService {
  constructor() {
    this.app = initializeFirebase();
    this.auth = this.app.auth();
    this.messaging = this.app.messaging();
  }

  // Verify Firebase ID token
  async verifyIdToken(idToken) {
    try {
      const decodedToken = await this.auth.verifyIdToken(idToken);
      return {
        success: true,
        uid: decodedToken.uid,
        phoneNumber: decodedToken.phone_number,
        email: decodedToken.email,
        name: decodedToken.name
      };
    } catch (error) {
      console.error('Error verifying ID token:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create custom token for user
  async createCustomToken(uid, claims = {}) {
    try {
      const customToken = await this.auth.createCustomToken(uid, claims);
      return {
        success: true,
        token: customToken
      };
    } catch (error) {
      console.error('Error creating custom token:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user by phone number
  async getUserByPhoneNumber(phoneNumber) {
    try {
      const userRecord = await this.auth.getUserByPhoneNumber(phoneNumber);
      return {
        success: true,
        user: {
          uid: userRecord.uid,
          phoneNumber: userRecord.phoneNumber,
          email: userRecord.email,
          displayName: userRecord.displayName,
          disabled: userRecord.disabled,
          metadata: userRecord.metadata
        }
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }
      console.error('Error getting user by phone:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const userRecord = await this.auth.createUser({
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        displayName: userData.name,
        disabled: false,
        emailVerified: false
      });

      return {
        success: true,
        user: {
          uid: userRecord.uid,
          phoneNumber: userRecord.phoneNumber,
          email: userRecord.email,
          displayName: userRecord.displayName
        }
      };
    } catch (error) {
      console.error('Error creating user:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update user data
  async updateUser(uid, updateData) {
    try {
      const userRecord = await this.auth.updateUser(uid, updateData);
      return {
        success: true,
        user: {
          uid: userRecord.uid,
          phoneNumber: userRecord.phoneNumber,
          email: userRecord.email,
          displayName: userRecord.displayName
        }
      };
    } catch (error) {
      console.error('Error updating user:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send push notification
  async sendNotification(token, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body
        },
        data,
        token
      };

      const response = await this.messaging.send(message);
      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      console.error('Error sending notification:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send notification to multiple devices
  async sendMulticastNotification(tokens, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body
        },
        data,
        tokens
      };

      const response = await this.messaging.sendMulticast(message);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };
    } catch (error) {
      console.error('Error sending multicast notification:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send emergency notification
  async sendEmergencyNotification(tokens, emergencyData) {
    const title = `🚨 Emergency Alert`;
    const body = `${emergencyData.type} emergency reported near ${emergencyData.location}`;
    
    const data = {
      type: 'emergency',
      emergencyId: emergencyData.id.toString(),
      emergencyType: emergencyData.type,
      latitude: emergencyData.latitude.toString(),
      longitude: emergencyData.longitude.toString(),
      timestamp: new Date().toISOString()
    };

    return await this.sendMulticastNotification(tokens, title, body, data);
  }

  // Send status update notification
  async sendStatusUpdateNotification(token, status, emergencyId) {
    const title = 'Emergency Status Update';
    const body = `Your emergency request status: ${status}`;
    
    const data = {
      type: 'status_update',
      emergencyId: emergencyId.toString(),
      status,
      timestamp: new Date().toISOString()
    };

    return await this.sendNotification(token, title, body, data);
  }

  // Verify phone number format
  validatePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid Indian phone number
    if (cleaned.length === 10 && cleaned[0] !== '0') {
      return `+91${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('+91')) {
      return cleaned;
    }
    
    throw new Error('Invalid phone number format');
  }
}

// Export singleton instance
module.exports = new FirebaseService();