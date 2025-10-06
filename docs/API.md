# 🚨 Aapatt Emergency Superapp - API Documentation

This document provides comprehensive API documentation for the Aapatt emergency response system.

## 🌐 Base URL

```
Development: http://localhost:3000/api
Production: https://your-api-domain.com/api
```

## 🔐 Authentication

All API endpoints (except auth endpoints) require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📱 Endpoints

### Authentication

#### Send OTP
```http
POST /auth/send-otp
```

**Request Body:**
```json
{
  "phoneNumber": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully.",
  "data": {
    "phoneNumber": "+919876543210",
    "expiresIn": 300
  }
}
```

#### Verify OTP
```http
POST /auth/verify-otp
```

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456",
  "name": "John Doe",
  "userType": "CITIZEN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "user_id",
      "phoneNumber": "+919876543210",
      "name": "John Doe",
      "userType": "CITIZEN"
    },
    "token": "jwt_token",
    "expiresIn": "7d"
  }
}
```

#### Get Profile
```http
GET /auth/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "phoneNumber": "+919876543210",
      "name": "John Doe",
      "userType": "CITIZEN",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Update Profile
```http
PUT /auth/profile
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "emergencyContacts": [
    {
      "name": "Emergency Contact",
      "phone": "+919876543211"
    }
  ]
}
```

### Emergency Requests

#### Create Emergency Request
```http
POST /requests
```

**Request Body:**
```json
{
  "serviceType": "AMBULANCE",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "address": "123 Main Street, Delhi",
  "landmark": "Near Metro Station",
  "description": "Medical emergency, person unconscious",
  "injuryType": "unconscious",
  "severity": "CRITICAL",
  "isSecurityAlert": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Emergency request created successfully.",
  "data": {
    "request": {
      "id": "request_id",
      "serviceType": "AMBULANCE",
      "status": "PENDING",
      "priority": "CRITICAL",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "address": "123 Main Street, Delhi",
      "requestedAt": "2024-01-01T00:00:00.000Z",
      "estimatedArrival": "2024-01-01T00:15:00.000Z"
    },
    "nearestProvider": {
      "id": "provider_id",
      "name": "Dr. Smith",
      "distance": 500,
      "eta": 15
    },
    "availableProviders": 3
  }
}
```

#### Get User Requests
```http
GET /requests?status=PENDING&limit=20&offset=0
```

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, ACCEPTED, EN_ROUTE, ARRIVED, COMPLETED, CANCELLED, EXPIRED)
- `limit` (optional): Number of requests to return (default: 20)
- `offset` (optional): Number of requests to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "request_id",
        "serviceType": "AMBULANCE",
        "status": "PENDING",
        "priority": "CRITICAL",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "address": "123 Main Street, Delhi",
        "requestedAt": "2024-01-01T00:00:00.000Z",
        "provider": {
          "id": "provider_id",
          "name": "Dr. Smith",
          "phoneNumber": "+919876543210",
          "providerProfile": {
            "serviceType": "AMBULANCE",
            "vehicleNumber": "DL01AB1234",
            "rating": 4.5
          }
        }
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 1
    }
  }
}
```

#### Get Specific Request
```http
GET /requests/{requestId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": "request_id",
      "serviceType": "AMBULANCE",
      "status": "EN_ROUTE",
      "priority": "CRITICAL",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "address": "123 Main Street, Delhi",
      "requestedAt": "2024-01-01T00:00:00.000Z",
      "acceptedAt": "2024-01-01T00:05:00.000Z",
      "citizen": {
        "id": "citizen_id",
        "name": "John Doe",
        "phoneNumber": "+919876543210"
      },
      "provider": {
        "id": "provider_id",
        "name": "Dr. Smith",
        "phoneNumber": "+919876543210",
        "providerProfile": {
          "serviceType": "AMBULANCE",
          "vehicleNumber": "DL01AB1234",
          "rating": 4.5,
          "currentLatitude": 28.6140,
          "currentLongitude": 77.2091
        }
      },
      "locationUpdates": [
        {
          "id": "update_id",
          "latitude": 28.6140,
          "longitude": 77.2091,
          "timestamp": "2024-01-01T00:10:00.000Z",
          "accuracy": 5.0,
          "speed": 15.5,
          "heading": 45.0
        }
      ]
    }
  }
}
```

#### Cancel Request
```http
PUT /requests/{requestId}/cancel
```

**Response:**
```json
{
  "success": true,
  "message": "Emergency request cancelled successfully.",
  "data": {
    "request": {
      "id": "request_id",
      "status": "CANCELLED",
      "completedAt": "2024-01-01T00:20:00.000Z"
    }
  }
}
```

### Provider Management

#### Create Provider Profile
```http
POST /providers/profile
```

**Request Body:**
```json
{
  "serviceType": "AMBULANCE",
  "licenseNumber": "MED123456",
  "vehicleNumber": "DL01AB1234"
}
```

#### Update Provider Location
```http
PUT /providers/location
```

**Request Body:**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "accuracy": 5.0,
  "speed": 15.5,
  "heading": 45.0
}
```

#### Toggle Provider Status
```http
PUT /providers/status
```

**Request Body:**
```json
{
  "isOnline": true
}
```

#### Get Available Requests
```http
GET /providers/requests?status=PENDING&limit=20&offset=0
```

#### Accept Request
```http
POST /providers/requests/{requestId}/accept
```

### AI Services

#### Analyze Injury
```http
POST /ai/analyze-injury
```

**Request Body:**
```json
{
  "image": "base64_encoded_image",
  "requestId": "request_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image analysis completed.",
  "data": {
    "analysis": {
      "injuryType": "burn",
      "confidence": 0.85,
      "severity": "moderate",
      "emergency": true,
      "firstAidSteps": [
        "Remove the person from the source of the burn",
        "Cool the burn with cool running water for 10-15 minutes",
        "Remove any clothing or jewelry near the burn area",
        "Cover the burn with a clean, dry cloth or sterile bandage"
      ],
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Get First Aid Guidance
```http
GET /ai/first-aid/{injuryType}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "injuryType": "burn",
    "guidance": {
      "steps": [
        "Remove the person from the source of the burn",
        "Cool the burn with cool running water for 10-15 minutes"
      ],
      "severity": "moderate",
      "emergency": true
    }
  }
}
```

### Admin Endpoints

#### Get Dashboard Statistics
```http
GET /admin/dashboard?period=24h
```

**Query Parameters:**
- `period` (optional): Time period (1h, 24h, 7d, 30d)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRequests": 150,
      "activeRequests": 5,
      "completedRequests": 140,
      "totalProviders": 25,
      "onlineProviders": 20,
      "avgResponseTime": 12
    },
    "requestsByType": [
      {
        "serviceType": "AMBULANCE",
        "_count": { "serviceType": 80 }
      },
      {
        "serviceType": "FIRE_BRIGADE",
        "_count": { "serviceType": 30 }
      }
    ],
    "requestsByStatus": [
      {
        "status": "COMPLETED",
        "_count": { "status": 140 }
      },
      {
        "status": "PENDING",
        "_count": { "status": 5 }
      }
    ]
  }
}
```

#### Get All Requests
```http
GET /admin/requests?status=PENDING&serviceType=AMBULANCE&limit=50&offset=0
```

#### Get All Providers
```http
GET /admin/providers?serviceType=AMBULANCE&isOnline=true&limit=50&offset=0
```

#### Update Provider Verification
```http
PUT /admin/providers/{providerId}/verify
```

**Request Body:**
```json
{
  "isVerified": true
}
```

## 🔌 WebSocket Events

### Client to Server Events

#### Authenticate
```javascript
socket.emit('authenticate', { token: 'jwt_token' })
```

#### Location Update (Providers)
```javascript
socket.emit('location_update', {
  latitude: 28.6139,
  longitude: 77.2090,
  requestId: 'request_id',
  accuracy: 5.0,
  speed: 15.5,
  heading: 45.0
})
```

#### Provider Status Update
```javascript
socket.emit('provider_status_update', {
  isOnline: true,
  serviceType: 'AMBULANCE'
})
```

#### Join Admin Dashboard
```javascript
socket.emit('join_admin_dashboard')
```

### Server to Client Events

#### Authenticated
```javascript
socket.on('authenticated', (data) => {
  console.log('Authenticated:', data)
  // { userId: 'user_id', userType: 'CITIZEN' }
})
```

#### New Emergency Request (Providers)
```javascript
socket.on('new_emergency_request', (data) => {
  console.log('New emergency request:', data)
  // Request details for providers
})
```

#### Request Status Update
```javascript
socket.on('request_status_update', (data) => {
  console.log('Request status update:', data)
  // { requestId: 'id', status: 'ACCEPTED', timestamp: '...' }
})
```

#### Provider Location Update (Citizens)
```javascript
socket.on('provider_location_update', (data) => {
  console.log('Provider location update:', data)
  // { requestId: 'id', latitude: 28.6139, longitude: 77.2090 }
})
```

#### Provider Status Changed (Admin)
```javascript
socket.on('provider_status_changed', (data) => {
  console.log('Provider status changed:', data)
  // { providerId: 'id', isOnline: true, serviceType: 'AMBULANCE' }
})
```

## 📊 Data Models

### User
```typescript
interface User {
  id: string
  phoneNumber: string
  name?: string
  email?: string
  userType: 'CITIZEN' | 'PROVIDER' | 'ADMIN'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  emergencyContacts?: EmergencyContact[]
  preferences?: UserPreferences
}
```

### Emergency Request
```typescript
interface EmergencyRequest {
  id: string
  citizenId: string
  providerId?: string
  serviceType: 'AMBULANCE' | 'FIRE_BRIGADE' | 'AIR_AMBULANCE' | 'POLICE' | 'SECURITY'
  status: 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  latitude: number
  longitude: number
  address?: string
  landmark?: string
  description?: string
  injuryType?: string
  severity?: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL' | 'FATAL'
  isSecurityAlert: boolean
  requestedAt: Date
  acceptedAt?: Date
  arrivedAt?: Date
  completedAt?: Date
  estimatedArrival?: Date
  actualArrival?: Date
  aiAnalysis?: any
  firstAidSteps?: string[]
}
```

### Provider Profile
```typescript
interface ProviderProfile {
  id: string
  userId: string
  serviceType: 'AMBULANCE' | 'FIRE_BRIGADE' | 'AIR_AMBULANCE' | 'POLICE' | 'SECURITY'
  licenseNumber?: string
  vehicleNumber?: string
  isVerified: boolean
  isOnline: boolean
  currentLatitude?: number
  currentLongitude?: number
  lastLocationUpdate?: Date
  rating: number
  totalJobs: number
  completedJobs: number
  createdAt: Date
  updatedAt: Date
}
```

## 🚨 Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": {} // Optional additional error details
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ENTRY`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## 🔒 Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **Emergency requests**: 3 requests per minute

## 📝 Response Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

For more information, see the [Setup Guide](SETUP.md) and [Deployment Guide](DEPLOYMENT.md).