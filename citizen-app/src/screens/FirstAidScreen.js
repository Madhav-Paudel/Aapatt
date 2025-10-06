/**
 * First Aid Screen
 * AI-powered first aid guidance
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

const FirstAidScreen = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      const response = await api.getAllFirstAidGuides();
      setGuides(response.data.guides || []);
    } catch (error) {
      console.error('Failed to load guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeInjury = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to analyze injuries');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setAnalyzing(true);
        
        try {
          const response = await api.analyzeInjury(result.assets[0].base64);
          const { analysis, firstAid } = response.data;

          Alert.alert(
            'Injury Analysis',
            `Detected: ${analysis.injuryType}\nConfidence: ${(analysis.confidence * 100).toFixed(0)}%\nSeverity: ${analysis.severity}`,
            [
              {
                text: 'View First Aid Steps',
                onPress: () => setSelectedGuide(firstAid),
              },
              { text: 'OK' },
            ]
          );

          if (analysis.autoCall911) {
            Alert.alert(
              'Critical Injury Detected',
              'This appears to be a critical injury. Would you like to request emergency services?',
              [
                { text: 'No', style: 'cancel' },
                { text: 'Yes, Call for Help', onPress: () => {/* Navigate to emergency */ } },
              ]
            );
          }
        } catch (error) {
          Alert.alert('Analysis Failed', 'Unable to analyze the injury. Please try again.');
        } finally {
          setAnalyzing(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      LOW: '#43A047',
      MEDIUM: '#FF9800',
      HIGH: '#E53935',
      CRITICAL: '#D32F2F',
    };
    return colors[severity] || '#9E9E9E';
  };

  if (selectedGuide) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedGuide(null)}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>First Aid Guide</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.guideContainer}>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(selectedGuide.severity) }]}>
            <Text style={styles.severityText}>Severity: {selectedGuide.severity}</Text>
          </View>

          <Text style={styles.guideTitle}>{selectedGuide.title}</Text>
          <Text style={styles.guideDescription}>{selectedGuide.description}</Text>

          <View style={styles.stepsContainer}>
            <Text style={styles.sectionTitle}>Steps to Follow:</Text>
            {selectedGuide.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {selectedGuide.warnings && selectedGuide.warnings.length > 0 && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={24} color="#FF9800" />
              <View style={styles.warningText}>
                <Text style={styles.warningTitle}>Warnings:</Text>
                {selectedGuide.warnings.map((warning, index) => (
                  <Text key={index} style={styles.warningItem}>• {warning}</Text>
                ))}
              </View>
            </View>
          )}

          {selectedGuide.autoCall911 && (
            <View style={styles.emergencyAlert}>
              <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
              <Text style={styles.emergencyText}>
                This injury requires immediate medical attention. Please call emergency services.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.aiSection}>
        <Text style={styles.sectionTitle}>AI Injury Analysis</Text>
        <Text style={styles.sectionDescription}>
          Take a photo of an injury for instant AI-powered analysis and first aid guidance
        </Text>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleAnalyzeInjury}
          disabled={analyzing}
        >
          {analyzing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="camera" size={24} color="#FFFFFF" />
              <Text style={styles.aiButtonText}>Analyze Injury</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.guidesSection}>
        <Text style={styles.sectionTitle}>First Aid Guides</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#E53935" />
        ) : guides.length > 0 ? (
          guides.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={styles.guideCard}
              onPress={() => setSelectedGuide(guide)}
            >
              <View style={styles.guideHeader}>
                <Text style={styles.guideCardTitle}>{guide.title}</Text>
                <View style={[styles.guideBadge, { backgroundColor: getSeverityColor(guide.severity) }]}>
                  <Text style={styles.guideBadgeText}>{guide.severity}</Text>
                </View>
              </View>
              <Text style={styles.guideCardDescription} numberOfLines={2}>
                {guide.description}
              </Text>
              <View style={styles.guideFooter}>
                <Ionicons name="chevron-forward" size={20} color="#1565C0" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No guides available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E53935',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  aiSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  aiButton: {
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  guidesSection: {
    padding: 16,
    paddingTop: 0,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  guideCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
    flex: 1,
  },
  guideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  guideBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  guideCardDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  guideFooter: {
    alignItems: 'flex-end',
  },
  guideContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  severityBadge: {
    padding: 12,
    alignItems: 'center',
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  guideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    padding: 16,
  },
  guideDescription: {
    fontSize: 16,
    color: '#757575',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  stepsContainer: {
    padding: 16,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  warningItem: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 4,
  },
  emergencyAlert: {
    flexDirection: 'row',
    backgroundColor: '#D32F2F',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 14,
    marginTop: 24,
  },
});

export default FirstAidScreen;
