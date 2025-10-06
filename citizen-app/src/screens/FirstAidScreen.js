import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity
} from 'react-native';
import { Button, Card, Title, Paragraph, ActivityIndicator, Chip } from 'react-native-paper';
import { Camera } from 'expo-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { analyzeInjury } from '../services/api';

const FirstAidScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const cameraRef = useRef(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });
        setCapturedImage(photo);
        await analyzeImage(photo.base64);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const analyzeImage = async (base64Image) => {
    setAnalyzing(true);
    try {
      const result = await analyzeInjury(base64Image);
      setAnalysis(result);
      
      // If critical emergency detected, offer to call 911
      if (result.emergency) {
        Alert.alert(
          'Critical Emergency Detected!',
          'This appears to be a life-threatening situation. Would you like to call emergency services immediately?',
          [
            { text: 'No', style: 'cancel' },
            { 
              text: 'Call Emergency', 
              onPress: () => Linking.openURL('tel:911') 
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setAnalysis(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Icon name="camera-alt" size={64} color="#ccc" />
        <Text style={styles.noPermissionText}>
          Camera access is required for AI first-aid analysis
        </Text>
        <Button mode="contained" onPress={() => Camera.requestCameraPermissionsAsync()}>
          Grant Camera Permission
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title>🤖 AI First-Aid Assistant</Title>
          <Paragraph>
            Point your camera at an injury or medical situation for instant analysis and first-aid guidance.
          </Paragraph>
        </Card.Content>
      </Card>

      {!capturedImage ? (
        <Card style={styles.cameraCard}>
          <Camera
            style={styles.camera}
            type={cameraType}
            ref={cameraRef}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={() => {
                    setCameraType(
                      cameraType === Camera.Constants.Type.back
                        ? Camera.Constants.Type.front
                        : Camera.Constants.Type.back
                    );
                  }}
                >
                  <Icon name="flip-camera-ios" size={30} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                
                <View style={styles.placeholder} />
              </View>
            </View>
          </Camera>
        </Card>
      ) : (
        <Card style={styles.imageCard}>
          <Image source={{ uri: capturedImage.uri }} style={styles.capturedImage} />
          <Card.Content>
            <View style={styles.imageActions}>
              <Button mode="outlined" onPress={retakePicture}>
                Retake Photo
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {analyzing && (
        <Card style={styles.analyzingCard}>
          <Card.Content>
            <View style={styles.analyzingContent}>
              <ActivityIndicator size="large" color="#E53935" />
              <Title>Analyzing Image...</Title>
              <Paragraph>AI is examining the image for injuries and medical conditions</Paragraph>
            </View>
          </Card.Content>
        </Card>
      )}

      {analysis && (
        <Card style={styles.analysisCard}>
          <Card.Content>
            <Title>🔍 AI Analysis Results</Title>
            
            {analysis.emergency && (
              <Chip 
                mode="flat" 
                icon="warning" 
                style={styles.emergencyChip}
                textStyle={styles.emergencyChipText}
              >
                EMERGENCY DETECTED
              </Chip>
            )}

            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>Detected Condition:</Text>
              <Text style={styles.conditionText}>{analysis.condition || 'Unable to determine'}</Text>
              <Text style={styles.confidenceText}>
                Confidence: {analysis.confidence ? `${(analysis.confidence * 100).toFixed(1)}%` : 'N/A'}
              </Text>
            </View>

            {analysis.severity && (
              <View style={styles.analysisSection}>
                <Text style={styles.sectionTitle}>Severity Level:</Text>
                <Chip 
                  mode="outlined" 
                  style={[
                    styles.severityChip,
                    { backgroundColor: getSeverityColor(analysis.severity) }
                  ]}
                >
                  {analysis.severity.toUpperCase()}
                </Chip>
              </View>
            )}

            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>🩹 First-Aid Steps:</Text>
              {analysis.firstAidSteps?.map((step, index) => (
                <View key={index} style={styles.stepContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {analysis.warnings && analysis.warnings.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.sectionTitle}>⚠️ Important Warnings:</Text>
                {analysis.warnings.map((warning, index) => (
                  <Text key={index} style={styles.warningText}>• {warning}</Text>
                ))}
              </View>
            )}

            {analysis.recommendations && (
              <View style={styles.analysisSection}>
                <Text style={styles.sectionTitle}>💡 Recommendations:</Text>
                {analysis.recommendations.map((rec, index) => (
                  <Text key={index} style={styles.recommendationText}>• {rec}</Text>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.disclaimerCard}>
        <Card.Content>
          <Title>⚠️ Important Disclaimer</Title>
          <Paragraph style={styles.disclaimerText}>
            This AI analysis is for informational purposes only and should not replace professional medical advice. 
            In case of serious injury or emergency, please call emergency services immediately.
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return '#ffebee';
    case 'high':
      return '#fff3e0';
    case 'moderate':
      return '#fff8e1';
    case 'low':
      return '#e8f5e8';
    default:
      return '#f5f5f5';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  cameraCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    overflow: 'hidden',
  },
  camera: {
    height: 400,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  flipButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 25,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E53935',
  },
  placeholder: {
    width: 50,
  },
  imageCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  capturedImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  analyzingCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  analyzingContent: {
    alignItems: 'center',
    padding: 20,
  },
  analysisCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  emergencyChip: {
    backgroundColor: '#ffebee',
    marginVertical: 8,
    alignSelf: 'flex-start',
  },
  emergencyChipText: {
    color: '#c62828',
    fontWeight: 'bold',
  },
  analysisSection: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  conditionText: {
    fontSize: 18,
    color: '#E53935',
    fontWeight: '500',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
  severityChip: {
    alignSelf: 'flex-start',
  },
  stepContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingRight: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E53935',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  warningText: {
    fontSize: 14,
    color: '#f57f17',
    marginVertical: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: '#388e3c',
    marginVertical: 2,
  },
  disclaimerCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    backgroundColor: '#fff8e1',
  },
  disclaimerText: {
    color: '#e65100',
    fontSize: 14,
    lineHeight: 20,
  },
  noPermissionText: {
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default FirstAidScreen;