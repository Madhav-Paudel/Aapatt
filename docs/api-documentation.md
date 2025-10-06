# Aapatt API Documentation

## Overview
RESTful API for the Aapatt emergency response system. Built with Express.js, PostgreSQL, and real-time WebSocket support.

**Base URL:** `https://api.aapatt.com` (production) | `http://localhost:3000` (development)

## Authentication
All API endpoints (except auth endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 🔐 Authentication

#### POST /api/auth/login
Send OTP for phone number login.

**Request:**
```json
{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "otpSent": true,
    "expiresIn": 300
  }
}
```

#### POST /api/auth/verify
Verify OTP and get JWT token.

**Request:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "phone": "+919876543210",
      "name": "John Doe",
      "role": "CITIZEN"
    }
  }
}
```

### 🚨 Emergency Requests

#### POST /api/requests/create
Create a new emergency request.

**Request:**
```json
{
  "type": "AMBULANCE",
  "location": {
    "coordinates": {
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "address": "Connaught Place, New Delhi",
    "landmark": "Near Metro Station"
  },
  "description": "Person collapsed, unconscious",
  "isSecurityAlert": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "req-uuid",
    "status": "PENDING",
    "estimatedArrival": "2024-01-15T15:30:00Z",
    "nearbyProviders": 3
  }
}
```

#### GET /api/requests/:id
Get emergency request details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "req-uuid",
    "type": "AMBULANCE",
    "status": "ENROUTE",
    "location": {
      "coordinates": { "latitude": 28.6139, "longitude": 77.2090 },
      "address": "Connaught Place, New Delhi"
    },
    "assignedProvider": {
      "id": "provider-uuid",
      "vehicleNumber": "DL-01-AB-1234",
      "currentLocation": { "latitude": 28.6100, "longitude": 77.2050 },
      "estimatedArrival": "2024-01-15T15:30:00Z"
    },
    "createdAt": "2024-01-15T15:20:00Z"
  }
}
```

#### PUT /api/requests/:id/cancel
Cancel an emergency request.

**Response:**
```json
{
  "success": true,
  "message": "Request cancelled successfully"
}
```

### 🚑 Providers

#### GET /api/providers/nearby
Get nearby available providers.

**Query Parameters:**
- `latitude` (required): Request latitude
- `longitude` (required): Request longitude  
- `type` (required): Emergency type (AMBULANCE, FIRE_BRIGADE, AIR_AMBULANCE)
- `radius` (optional): Search radius in meters (default: 10000)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "provider-uuid",
      "type": "AMBULANCE",
      "vehicleNumber": "DL-01-AB-1234",
      "currentLocation": {
        "coordinates": { "latitude": 28.6100, "longitude": 77.2050 },
        "address": "Near India Gate"
      },
      "distance": 1250,
      "estimatedArrival": "2024-01-15T15:30:00Z"
    }
  ]
}
```

#### PUT /api/providers/:id/location
Update provider location (Provider only).

**Request:**
```json
{
  "location": {
    "coordinates": { "latitude": 28.6139, "longitude": 77.2090 },
    "address": "Current location address"
  },
  "status": "AVAILABLE"
}
```

#### PUT /api/providers/:id/status
Update provider status (Provider only).

**Request:**
```json
{
  "status": "AVAILABLE",
  "isOnline": true
}
```

#### POST /api/providers/:providerId/accept/:requestId
Accept an emergency request (Provider only).

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "req-uuid",
    "status": "ACCEPTED",
    "estimatedArrival": "2024-01-15T15:30:00Z"
  }
}
```

### 🤖 AI First Aid

#### POST /api/ai/analyze
Analyze image for first aid guidance.

**Request:**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "location": {
    "coordinates": { "latitude": 28.6139, "longitude": 77.2090 }
  },
  "additionalInfo": "Person seems unconscious"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "condition": "UNCONSCIOUS",
    "confidence": 0.85,
    "firstAidSteps": [
      "Check for responsiveness",
      "Check for breathing and pulse", 
      "Place in recovery position if breathing",
      "Do not leave alone",
      "Call emergency services immediately"
    ],
    "videoUrl": "https://youtube.com/watch?v=unconscious-first-aid",
    "emergency": true
  }
}
```

### 📱 Notifications

#### GET /api/notifications
Get user notifications.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `unreadOnly` (optional): Show only unread notifications

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-uuid",
        "title": "Request Accepted",
        "body": "Ambulance DL-01-AB-1234 is on the way",
        "isRead": false,
        "sentAt": "2024-01-15T15:25:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

#### PUT /api/notifications/:id/read
Mark notification as read.

### 👑 Admin Endpoints

#### GET /api/admin/dashboard
Get admin dashboard data (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "activeRequests": 12,
      "availableProviders": 45,
      "totalRequestsToday": 89,
      "averageResponseTime": 8.5
    },
    "recentRequests": [...],
    "providerStatus": [...]
  }
}
```

## WebSocket Events

Connect to WebSocket at `/` with authentication:

```javascript
const socket = io('ws://localhost:3000', {
  auth: { token: 'jwt_token' }
});
```

### Events

#### Client → Server

**join_room**
```json
{
  "room": "request_req-uuid"  // or "provider_provider-uuid"
}
```

**provider_location_update**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "accuracy": 5
}
```

#### Server → Client

**request_created**
```json
{
  "type": "request_created",
  "data": {
    "requestId": "req-uuid",
    "type": "AMBULANCE",
    "location": {...},
    "distance": 1500
  }
}
```

**request_assigned**
```json
{
  "type": "request_assigned", 
  "data": {
    "requestId": "req-uuid",
    "providerId": "provider-uuid",
    "estimatedArrival": "2024-01-15T15:30:00Z"
  }
}
```

**provider_location_update**
```json
{
  "type": "provider_location_update",
  "data": {
    "providerId": "provider-uuid",
    "location": { "latitude": 28.6139, "longitude": 77.2090 },
    "estimatedArrival": "2024-01-15T15:28:00Z"
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `VALIDATION_ERROR` | 400 | Request data validation failed |
| `NO_PROVIDERS_AVAILABLE` | 404 | No providers found for the request |
| `REQUEST_ALREADY_ASSIGNED` | 409 | Request is already assigned to a provider |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests from client |
| `AI_SERVICE_ERROR` | 503 | AI analysis service is unavailable |

## Rate Limits

- **Authentication:** 5 requests per minute per IP
- **General API:** 100 requests per 15 minutes per user
- **Location Updates:** 30 requests per minute per provider
- **AI Analysis:** 5 requests per minute per user

## Free Tier Limits

- **AI Analysis:** 30 requests per minute (Hugging Face limit)
- **Database:** 500MB storage (Supabase)
- **File Upload:** 5MB max file size
- **Notifications:** 1000 per day (Firebase FCM)

## SDKs and Tools

### cURL Examples

**Create Emergency Request:**
```bash
curl -X POST https://api.aapatt.com/api/requests/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "AMBULANCE",
    "location": {
      "coordinates": {"latitude": 28.6139, "longitude": 77.2090},
      "address": "Connaught Place, New Delhi"
    },
    "description": "Medical emergency"
  }'
```

### JavaScript/React Native
```javascript
const API_BASE = 'https://api.aapatt.com';

const createEmergencyRequest = async (requestData) => {
  const response = await fetch(`${API_BASE}/api/requests/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });
  
  return response.json();
};
```