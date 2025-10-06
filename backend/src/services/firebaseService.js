/**
 * Firebase Service
 * Handles Firebase Admin SDK initialization and authentication
 */

import admin from 'firebase-admin';

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 */
export const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (firebaseApp) {
      return firebaseApp;
    }
    
    // Initialize with service account or environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      });
    } else {
      // Fallback for development
      console.warn('⚠️  Firebase credentials not found. Using development mode.');
      // In development, you might want to skip Firebase or use a different auth method
    }
    
    return firebaseApp;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    // Don't throw - allow app to run without Firebase in development
  }
};

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<Object>} Decoded token
 */
export const verifyIdToken = async (idToken) => {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase not initialized');
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid authentication token');
  }
};

/**
 * Send push notification using FCM
 * @param {string} fcmToken - Device FCM token
 * @param {Object} notification - Notification payload
 */
export const sendPushNotification = async (fcmToken, notification) => {
  try {
    if (!firebaseApp) {
      console.warn('Firebase not initialized - skipping notification');
      return null;
    }
    
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'max'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };
    
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
};

/**
 * Send push notification to multiple devices
 * @param {string[]} fcmTokens - Array of FCM tokens
 * @param {Object} notification - Notification payload
 */
export const sendMulticastNotification = async (fcmTokens, notification) => {
  try {
    if (!firebaseApp || !fcmTokens || fcmTokens.length === 0) {
      return null;
    }
    
    const message = {
      tokens: fcmTokens,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {}
    };
    
    const response = await admin.messaging().sendMulticast(message);
    return response;
  } catch (error) {
    console.error('Failed to send multicast notification:', error);
    throw error;
  }
};

export default {
  initializeFirebase,
  verifyIdToken,
  sendPushNotification,
  sendMulticastNotification
};
