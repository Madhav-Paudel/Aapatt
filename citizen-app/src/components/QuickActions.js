import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../utils/theme';

const QuickActions = ({ navigation }) => {
  const actions = [
    {
      id: 'first-aid',
      title: 'First Aid Guide',
      subtitle: 'AI-powered guidance',
      icon: '🏥',
      color: colors.info,
      onPress: () => navigation.navigate('FirstAid'),
    },
    {
      id: 'history',
      title: 'Request History',
      subtitle: 'View past requests',
      icon: '📋',
      color: colors.secondary,
      onPress: () => navigation.navigate('History'),
    },
    {
      id: 'contacts',
      title: 'Emergency Contacts',
      subtitle: 'Manage contacts',
      icon: '👥',
      color: colors.warning,
      onPress: () => navigation.navigate('Contacts'),
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences',
      icon: '⚙️',
      color: colors.gray,
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, { backgroundColor: action.color }]}
            onPress={action.onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  actionCard: {
    width: 120,
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 11,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
});

export default QuickActions;