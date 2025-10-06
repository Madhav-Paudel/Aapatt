import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  TextInput, 
  Switch, 
  Divider,
  Avatar 
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { updateProfile, getUserProfile, logout } from '../services/api';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    emergencyContacts: [],
    notifications: {
      sound: true,
      vibration: true,
      locationTracking: true,
      securityAlerts: false
    }
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(profile);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            await AsyncStorage.removeItem('authToken');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const updateNotificationSetting = (key, value) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileHeader}>
          <Avatar.Text 
            size={80} 
            label={profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Title style={styles.profileName}>
              {profile.name || 'User Name'}
            </Title>
            <Text style={styles.profilePhone}>
              {profile.phone || 'No phone number'}
            </Text>
            <Button 
              mode="outlined" 
              onPress={() => setEditing(!editing)}
              icon={editing ? "close" : "edit"}
              style={styles.editButton}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Personal Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title>Personal Information</Title>
          <TextInput
            label="Full Name"
            value={profile.name}
            onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
            style={styles.input}
            disabled={!editing}
          />
          <TextInput
            label="Phone Number"
            value={profile.phone}
            onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
            style={styles.input}
            disabled={!editing}
            keyboardType="phone-pad"
          />
          <TextInput
            label="Email Address"
            value={profile.email}
            onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
            style={styles.input}
            disabled={!editing}
            keyboardType="email-address"
          />
          <TextInput
            label="Home Address"
            value={profile.address}
            onChangeText={(text) => setProfile(prev => ({ ...prev, address: text }))}
            style={styles.input}
            disabled={!editing}
            multiline
          />
          
          {editing && (
            <Button 
              mode="contained" 
              onPress={saveProfile}
              loading={loading}
              style={styles.saveButton}
            >
              Save Changes
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Notification Settings */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title>Notification Settings</Title>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sound Notifications</Text>
              <Text style={styles.settingDescription}>
                Play sound for emergency alerts
              </Text>
            </View>
            <Switch
              value={profile.notifications.sound}
              onValueChange={(value) => updateNotificationSetting('sound', value)}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Vibration</Text>
              <Text style={styles.settingDescription}>
                Vibrate device for emergency notifications
              </Text>
            </View>
            <Switch
              value={profile.notifications.vibration}
              onValueChange={(value) => updateNotificationSetting('vibration', value)}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Location Tracking</Text>
              <Text style={styles.settingDescription}>
                Allow emergency responders to track your location
              </Text>
            </View>
            <Switch
              value={profile.notifications.locationTracking}
              onValueChange={(value) => updateNotificationSetting('locationTracking', value)}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Security Alerts</Text>
              <Text style={styles.settingDescription}>
                Automatically notify security when requesting help
              </Text>
            </View>
            <Switch
              value={profile.notifications.securityAlerts}
              onValueChange={(value) => updateNotificationSetting('securityAlerts', value)}
            />
          </View>
        </Card.Content>
      </Card>

      {/* App Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title>App Information</Title>
          
          <View style={styles.infoRow}>
            <Icon name="info" size={20} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="help" size={20} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Emergency Numbers</Text>
              <Text style={styles.infoValue}>
                Ambulance: 102 | Fire: 101 | Police: 100
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            icon="help"
            onPress={() => Linking.openURL('https://aapatt.help/support')}
            style={styles.actionButton}
          >
            Help & Support
          </Button>

          <Button
            mode="outlined"
            icon="privacy-tip"
            onPress={() => Linking.openURL('https://aapatt.help/privacy')}
            style={styles.actionButton}
          >
            Privacy Policy
          </Button>

          <Button
            mode="outlined"
            icon="description"
            onPress={() => Linking.openURL('https://aapatt.help/terms')}
            style={styles.actionButton}
          >
            Terms of Service
          </Button>
        </Card.Content>
      </Card>

      {/* Logout */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Button
            mode="contained"
            icon="logout"
            onPress={handleLogout}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonText}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      {/* App Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🚨 Aapatt Emergency Response System
        </Text>
        <Text style={styles.footerSubtext}>
          Saving lives through intelligent technology
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#E53935',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  input: {
    marginVertical: 4,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: '#E53935',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    marginVertical: 16,
  },
  actionButton: {
    marginVertical: 4,
  },
  logoutButton: {
    backgroundColor: '#757575',
  },
  logoutButtonText: {
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default ProfileScreen;