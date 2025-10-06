import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.phone}>{user?.phone}</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#424242', marginBottom: 8 },
  phone: { fontSize: 16, color: '#757575', marginBottom: 32 },
  button: { backgroundColor: '#D32F2F', padding: 16, borderRadius: 8, width: '100%' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});

export default ProfileScreen;
