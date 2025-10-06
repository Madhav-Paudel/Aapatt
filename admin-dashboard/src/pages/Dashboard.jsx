import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Paper,
} from '@mui/material';
import {
  LocalHospital,
  FireTruck,
  Flight,
  People,
  Timeline,
  Emergency,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';

// Components
import StatsCard from '../components/StatsCard';
import EmergencyMap from '../components/EmergencyMap';
import RecentRequests from '../components/RecentRequests';
import ProviderStatus from '../components/ProviderStatus';

// Services
import { getDashboardStats, getActiveRequests, getRecentRequests } from '../services/api';
import { subscribeToRealTimeUpdates } from '../services/socket';

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeEmergencies: 0,
    availableProviders: 0,
    averageResponseTime: 0,
    completedToday: 0,
    byType: {
      ambulance: 0,
      fireBrigade: 0,
      airAmbulance: 0,
    },
    trends: {
      emergencies: 0,
      providers: 0,
      responseTime: 0,
      completed: 0,
    }
  });

  const [activeRequests, setActiveRequests] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
    setupRealTimeUpdates();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      
      // Load all dashboard data in parallel
      const [statsData, activeData, recentData] = await Promise.all([
        getDashboardStats(),
        getActiveRequests(),
        getRecentRequests(10)
      ]);

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (activeData.success) {
        setActiveRequests(activeData.data);
      }

      if (recentData.success) {
        setRecentRequests(recentData.data.requests);
      }

    } catch (error) {
      console.error('Dashboard data loading error:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Subscribe to real-time updates
    subscribeToRealTimeUpdates('dashboard_stats', (data) => {
      setStats(prevStats => ({ ...prevStats, ...data }));
    });

    subscribeToRealTimeUpdates('new_emergency_request', (data) => {
      setActiveRequests(prev => [data, ...prev]);
      setStats(prev => ({
        ...prev,
        activeEmergencies: prev.activeEmergencies + 1
      }));
    });

    subscribeToRealTimeUpdates('request_completed', (data) => {
      setActiveRequests(prev => prev.filter(req => req.id !== data.requestId));
      setStats(prev => ({
        ...prev,
        activeEmergencies: Math.max(0, prev.activeEmergencies - 1),
        completedToday: prev.completedToday + 1
      }));
    });

    subscribeToRealTimeUpdates('provider_status_change', (data) => {
      setStats(prev => ({
        ...prev,
        availableProviders: data.availableCount
      }));
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        🚨 Aapatt Emergency Response Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Emergencies"
            value={stats.activeEmergencies}
            icon={<Emergency />}
            color="error"
            trend={stats.trends.emergencies}
            subtitle="Currently active"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Available Providers"
            value={stats.availableProviders}
            icon={<People />}
            color="primary"
            trend={stats.trends.providers}
            subtitle="Online now"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Avg Response Time"
            value={`${stats.averageResponseTime} min`}
            icon={<Schedule />}
            color="warning"
            trend={stats.trends.responseTime}
            subtitle="Last 24 hours"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Completed Today"
            value={stats.completedToday}
            icon={<CheckCircle />}
            color="success"
            trend={stats.trends.completed}
            subtitle="Successfully resolved"
          />
        </Grid>
      </Grid>

      {/* Emergency Type Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LocalHospital sx={{ mr: 1, color: '#E53935' }} />
                <Typography variant="h6">Ambulance</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {stats.byType.ambulance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FireTruck sx={{ mr: 1, color: '#FF5722' }} />
                <Typography variant="h6">Fire Brigade</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {stats.byType.fireBrigade}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Flight sx={{ mr: 1, color: '#D32F2F' }} />
                <Typography variant="h6">Air Ambulance</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {stats.byType.airAmbulance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={3}>
        {/* Live Emergency Map */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: 500 }}>
            <Typography variant="h6" gutterBottom>
              Live Emergency Map
            </Typography>
            <EmergencyMap 
              activeRequests={activeRequests}
              height={450}
            />
          </Paper>
        </Grid>

        {/* Provider Status */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, height: 500 }}>
            <Typography variant="h6" gutterBottom>
              Provider Status
            </Typography>
            <ProviderStatus />
          </Paper>
        </Grid>

        {/* Recent Requests */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Emergency Requests
            </Typography>
            <RecentRequests 
              requests={recentRequests}
              onRequestClick={(requestId) => {
                // Handle request click - could open details modal
                console.log('Request clicked:', requestId);
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* System Status Footer */}
      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center">
                  <Box
                    width={12}
                    height={12}
                    borderRadius="50%"
                    bgcolor="success.main"
                    mr={1}
                  />
                  <Typography variant="body2">
                    API Server: Online
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center">
                  <Box
                    width={12}
                    height={12}
                    borderRadius="50%"
                    bgcolor="success.main"
                    mr={1}
                  />
                  <Typography variant="body2">
                    Database: Connected
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center">
                  <Box
                    width={12}
                    height={12}
                    borderRadius="50%"
                    bgcolor="success.main"
                    mr={1}
                  />
                  <Typography variant="body2">
                    Real-time: Active
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}