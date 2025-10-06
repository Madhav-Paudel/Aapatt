import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HistoryScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Job History</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: '#757575' },
});

export default HistoryScreen;
