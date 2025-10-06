import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const initializeNotifications = async () => {
  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    // Get push notification token
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'aapatt-emergency' // Replace with your Expo project ID
    })).data;

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('emergency', {
        name: 'Emergency Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E53935',
      });

      Notifications.setNotificationChannelAsync('updates', {
        name: 'Status Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1565C0',
      });
    }

    return token;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
};

export const sendLocalNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
};

export const sendEmergencyNotification = async (type, message) => {
  await sendLocalNotification(
    `🚨 Emergency ${type}`,
    message,
    {
      type: 'emergency',
      emergencyType: type
    }
  );
};

export const sendStatusUpdateNotification = async (status, message) => {
  await sendLocalNotification(
    `📍 Status Update`,
    message,
    {
      type: 'status_update',
      status
    }
  );
};

// Listen for incoming notifications
export const addNotificationListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

// Listen for notification responses (when user taps notification)
export const addNotificationResponseListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

export default {
  initializeNotifications,
  sendLocalNotification,
  sendEmergencyNotification,
  sendStatusUpdateNotification,
  addNotificationListener,
  addNotificationResponseListener
};