/**
 * Aapatt Emergency Superapp - Firebase Service
 * Firebase Admin SDK for authentication and push notifications
 */

const admin = require('firebase-admin');
const logger = require('./loggerService');

let firebaseApp;

/**
 * Initialize Firebase Admin SDK
 */
async function initializeFirebase() {
  try {
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error('Firebase configuration missing');
    }

    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    logger.info('✅ Firebase Admin SDK initialized');
  } catch (error) {
    logger.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<Object>} Decoded token
 */
async function verifyIdToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    logger.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
}

/**
 * Create custom token for user
 * @param {string} uid - User UID
 * @param {Object} additionalClaims - Additional claims
 * @returns {Promise<string>} Custom token
 */
async function createCustomToken(uid, additionalClaims = {}) {
  try {
    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    logger.error('Custom token creation failed:', error);
    throw error;
  }
}

/**
 * Send push notification to device
 * @param {string} token - FCM device token
 * @param {Object} notification - Notification payload
 * @param {Object} data - Data payload
 * @returns {Promise<string>} Message ID
 */
async function sendPushNotification(token, notification, data = {}) {
  try {
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'emergency_channel',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body
            },
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    logger.info(`Push notification sent successfully: ${response}`);
    return response;
  } catch (error) {
    logger.error('Push notification failed:', error);
    throw error;
  }
}

/**
 * Send push notification to multiple devices
 * @param {Array<string>} tokens - Array of FCM device tokens
 * @param {Object} notification - Notification payload
 * @param {Object} data - Data payload
 * @returns {Promise<Object>} Batch response
 */
async function sendMulticastNotification(tokens, notification, data = {}) {
  try {
    if (!tokens || tokens.length === 0) {
      throw new Error('No tokens provided');
    }

    const message = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'emergency_channel',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body
            },
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().sendMulticast(message);
    
    logger.info(`Multicast notification sent: ${response.successCount}/${tokens.length} successful`);
    
    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push({
            token: tokens[idx],
            error: resp.error
          });
        }
      });
      
      logger.warn(`Failed tokens:`, failedTokens);
    }

    return response;
  } catch (error) {
    logger.error('Multicast notification failed:', error);
    throw error;
  }
}

/**
 * Send topic-based notification
 * @param {string} topic - Topic name
 * @param {Object} notification - Notification payload
 * @param {Object} data - Data payload
 * @returns {Promise<string>} Message ID
 */
async function sendTopicNotification(topic, notification, data = {}) {
  try {
    const message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'emergency_channel',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body
            },
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    logger.info(`Topic notification sent successfully: ${response}`);
    return response;
  } catch (error) {
    logger.error('Topic notification failed:', error);
    throw error;
  }
}

/**
 * Subscribe device to topic
 * @param {string|Array<string>} tokens - Device token(s)
 * @param {string} topic - Topic name
 * @returns {Promise<Object>} Subscription response
 */
async function subscribeToTopic(tokens, topic) {
  try {
    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
    const response = await admin.messaging().subscribeToTopic(tokenArray, topic);
    
    logger.info(`Subscribed ${response.successCount} devices to topic: ${topic}`);
    return response;
  } catch (error) {
    logger.error('Topic subscription failed:', error);
    throw error;
  }
}

/**
 * Unsubscribe device from topic
 * @param {string|Array<string>} tokens - Device token(s)
 * @param {string} topic - Topic name
 * @returns {Promise<Object>} Unsubscription response
 */
async function unsubscribeFromTopic(tokens, topic) {
  try {
    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
    const response = await admin.messaging().unsubscribeFromTopic(tokenArray, topic);
    
    logger.info(`Unsubscribed ${response.successCount} devices from topic: ${topic}`);
    return response;
  } catch (error) {
    logger.error('Topic unsubscription failed:', error);
    throw error;
  }
}

/**
 * Get user by phone number
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<Object>} User record
 */
async function getUserByPhoneNumber(phoneNumber) {
  try {
    const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    logger.error('Error getting user by phone number:', error);
    throw error;
  }
}

/**
 * Create Firebase user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} User record
 */
async function createFirebaseUser(userData) {
  try {
    const userRecord = await admin.auth().createUser({
      phoneNumber: userData.phoneNumber,
      displayName: userData.name,
      email: userData.email,
      disabled: false
    });
    
    logger.info(`Firebase user created: ${userRecord.uid}`);
    return userRecord;
  } catch (error) {
    logger.error('Firebase user creation failed:', error);
    throw error;
  }
}

/**
 * Update Firebase user
 * @param {string} uid - User UID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated user record
 */
async function updateFirebaseUser(uid, updateData) {
  try {
    const userRecord = await admin.auth().updateUser(uid, updateData);
    logger.info(`Firebase user updated: ${uid}`);
    return userRecord;
  } catch (error) {
    logger.error('Firebase user update failed:', error);
    throw error;
  }
}

/**
 * Delete Firebase user
 * @param {string} uid - User UID
 * @returns {Promise<void>}
 */
async function deleteFirebaseUser(uid) {
  try {
    await admin.auth().deleteUser(uid);
    logger.info(`Firebase user deleted: ${uid}`);
  } catch (error) {
    logger.error('Firebase user deletion failed:', error);
    throw error;
  }
}

/**
 * Generate phone auth link (for testing)
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<string>} Auth link
 */
async function generatePhoneAuthLink(phoneNumber) {
  try {
    // This is typically handled by client SDK
    // This function is for testing purposes
    const actionCodeSettings = {
      url: `${process.env.APP_URL}/auth/verify`,
      handleCodeInApp: true
    };
    
    // Note: This is a placeholder - actual phone auth is handled differently
    logger.info(`Phone auth requested for: ${phoneNumber}`);
    return 'phone-auth-link';
  } catch (error) {
    logger.error('Phone auth link generation failed:', error);
    throw error;
  }
}

/**
 * Validate FCM token
 * @param {string} token - FCM token
 * @returns {Promise<boolean>} Token validity
 */
async function validateFCMToken(token) {
  try {
    // Try to send a test message to validate token
    const message = {
      token,
      data: {
        test: 'true'
      },
      android: {
        priority: 'high'
      }
    };
    
    await admin.messaging().send(message, true); // dry run
    return true;
  } catch (error) {
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      return false;
    }
    throw error;
  }
}

module.exports = {
  initializeFirebase,
  verifyIdToken,
  createCustomToken,
  sendPushNotification,
  sendMulticastNotification,
  sendTopicNotification,
  subscribeToTopic,
  unsubscribeFromTopic,
  getUserByPhoneNumber,
  createFirebaseUser,
  updateFirebaseUser,
  deleteFirebaseUser,
  generatePhoneAuthLink,
  validateFCMToken
};