import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';

// Pages
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Providers from './pages/Providers';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Services
import { checkAuthToken, getCurrentUser } from './services/api';
import { initializeSocket } from './services/socket';

// Create theme
const createAppTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#E53935',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1565C0',
      contrastText: '#ffffff',
    },
    success: {
      main: '#43A047',
    },
    warning: {
      main: '#FFEB3B',
    },
    background: {
      default: darkMode ? '#121212' : '#f5f5f5',
      paper: darkMode ? '#1e1e1e' : '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: darkMode ? '#1e1e1e' : '#1565C0',
          color: '#ffffff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#E53935',
        },
      },
    },
  },
});

const DRAWER_WIDTH = 240;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem('aapatt-theme');
      if (savedTheme) {
        setDarkMode(savedTheme === 'dark');
      }

      // Check authentication
      const token = localStorage.getItem('authToken');
      if (token) {
        const isValid = await checkAuthToken(token);
        if (isValid) {
          setIsAuthenticated(true);
          const user = await getCurrentUser();
          setCurrentUser(user);
          
          // Initialize socket connection
          initializeSocket(token);
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
    } catch (error) {
      console.error('App initialization error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (token, userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    initializeSocket(token);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('aapatt-theme', newTheme ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const theme = createAppTheme(darkMode);

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          sx={{ backgroundColor: 'background.default' }}
        >
          <div>Loading Aapatt Admin Dashboard...</div>
        </Box>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginPage onLogin={handleLogin} darkMode={darkMode} toggleTheme={toggleTheme} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Navbar
            drawerWidth={DRAWER_WIDTH}
            onMenuClick={toggleSidebar}
            onLogout={handleLogout}
            currentUser={currentUser}
            darkMode={darkMode}
            onToggleTheme={toggleTheme}
          />
          
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            drawerWidth={DRAWER_WIDTH}
            currentUser={currentUser}
          />
          
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` },
              ml: { sm: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
              mt: '64px', // AppBar height
              backgroundColor: 'background.default',
              minHeight: 'calc(100vh - 64px)',
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/live-map" element={<LiveMap />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;