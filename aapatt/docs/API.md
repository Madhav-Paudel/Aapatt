# Aapatt Emergency Superapp API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "name": "John Doe",
  "email": "john@example.com",
  "userType": "CITIZEN"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user-123",
    "phoneNumber": "+919876543210",
    "name": "John Doe",
    "userType": "CITIZEN",
    "isVerified": false
  },
  "token": "jwt-token"
}
```

#### POST /api/auth/verify-phone
Verify phone number with Firebase token.

**Request Body:**
```json
{
  "idToken": "firebase-id-token"
}
```

#### POST /api/auth/login
Login user with phone number and Firebase token.

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "idToken": "firebase-id-token"
}
```

#### GET /api/auth/profile
Get user profile.

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "phoneNumber": "+919876543210",
    "name": "John Doe",
    "userType": "CITIZEN",
    "isVerified": true,
    "profile": {
      "address": "123 Main St",
      "emergencyContacts": {}
    }
  }
}
```

#### PUT /api/auth/profile
Update user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St"
}
```

### Emergency Requests

#### POST /api/requests
Create emergency request.

**Request Body:**
```json
{
  "requestType": "AMBULANCE",
  "description": "Medical emergency",
  "address": "123 Main St",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Response:**
```json
{
  "message": "Emergency request created successfully",
  "request": {
    "id": "req-123",
    "requestType": "AMBULANCE",
    "status": "PENDING",
    "description": "Medical emergency",
    "address": "123 Main St",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "createdAt": "2023-12-01T10:00:00Z",
    "nearestProvider": {
      "id": "provider-123",
      "name": "Dr. Smith",
      "distance": 500
    }
  }
}
```

#### GET /api/requests
Get user's emergency requests.

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Offset for pagination (default: 0)

#### GET /api/requests/:requestId
Get request details.

#### PUT /api/requests/:requestId/status
Update request status.

**Request Body:**
```json
{
  "status": "EN_ROUTE",
  "message": "On the way",
  "latitude": 28.6140,
  "longitude": 77.2091
}
```

#### POST /api/requests/:requestId/cancel
Cancel emergency request.

### Provider Management

#### PUT /api/providers/profile
Update provider profile.

**Request Body:**
```json
{
  "serviceType": "AMBULANCE",
  "licenseNumber": "AMB123456",
  "vehicleInfo": {
    "vehicleNumber": "DL01AB1234",
    "vehicleType": "Ambulance"
  }
}
```

#### PUT /api/providers/status
Update provider online/available status.

**Request Body:**
```json
{
  "isOnline": true,
  "isAvailable": true,
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

#### GET /api/providers/requests
Get available emergency requests for provider.

#### POST /api/providers/requests/:requestId/accept
Accept an emergency request.

#### GET /api/providers/my-requests
Get provider's accepted requests.

#### PUT /api/providers/requests/:requestId/location
Update location for accepted request.

**Request Body:**
```json
{
  "latitude": 28.6140,
  "longitude": 77.2091,
  "status": "EN_ROUTE",
  "message": "On the way"
}
```

### AI Services

#### POST /api/ai/analyze-injury
Analyze injury from image using AI.

**Request Body:**
```json
{
  "imageBase64": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "analysis": {
    "injuryType": "cut",
    "severity": "minor",
    "confidence": 0.85,
    "firstAidSteps": [
      {
        "step": 1,
        "title": "Stop the bleeding",
        "description": "Apply direct pressure to the wound",
        "image": "https://example.com/step1.jpg",
        "video": "https://example.com/step1.mp4"
      }
    ],
    "emergencyCallNeeded": false
  }
}
```

#### GET /api/ai/first-aid-guidance
Get first aid guidance for specific injury.

**Query Parameters:**
- `injuryType`: Type of injury (cut, burn, fall, etc.)
- `severity`: Severity level (minor, major)

#### GET /api/ai/emergency-contacts
Get emergency contacts for location.

**Query Parameters:**
- `latitude` (optional): Latitude
- `longitude` (optional): Longitude

### Admin Dashboard

#### GET /api/admin/dashboard
Get dashboard statistics.

**Response:**
```json
{
  "stats": {
    "activeRequests": 5,
    "completedToday": 12,
    "providersOnline": 8,
    "providersAvailable": 6,
    "avgResponseTime": 8.5,
    "requestsByType": [
      { "type": "AMBULANCE", "count": 3 },
      { "type": "FIRE_BRIGADE", "count": 2 }
    ],
    "requestsByStatus": [
      { "status": "PENDING", "count": 2 },
      { "status": "ACCEPTED", "count": 3 }
    ]
  }
}
```

#### GET /api/admin/live-map
Get live map data (requests and providers).

#### GET /api/admin/providers
Get all providers with filtering.

**Query Parameters:**
- `status` (optional): Filter by status (online, offline, available)
- `serviceType` (optional): Filter by service type
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

#### PUT /api/admin/providers/:providerId/status
Update provider status.

#### GET /api/admin/analytics
Get analytics data.

**Query Parameters:**
- `period` (optional): Time period (1d, 7d, 30d)

#### GET /api/admin/health
Get system health status.

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "phoneNumber",
      "message": "Valid phone number required"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited to prevent abuse:
- 100 requests per minute per IP
- 1000 requests per hour per user

## WebSocket Events

### Client to Server
- `join-user-room` - Join user's personal room
- `join-provider-room` - Join provider service type room
- `join-admin-dashboard` - Join admin dashboard room
- `provider-status` - Update provider status
- `location-update` - Update location
- `emergency-request` - Broadcast emergency request
- `request-status-update` - Update request status

### Server to Client
- `new-emergency-request` - New emergency request
- `request-accepted` - Request accepted
- `request-update` - Request status update
- `request-cancelled` - Request cancelled
- `provider-status-update` - Provider status update
- `provider-location-update` - Provider location update
- `system-alert` - System alert