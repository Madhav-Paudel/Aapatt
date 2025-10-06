# 📡 Aapatt API Documentation

Complete API reference for the Aapatt emergency response system.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "phone": "+919876543210",
  "name": "John Doe",
  "role": "CITIZEN"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "phone": "+919876543210",
    "name": "John Doe",
    "role": "CITIZEN"
  },
  "token": "jwt-token"
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "jwt-token"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

---

## 🚨 Emergency Request Endpoints

### Create Emergency Request
```http
POST /requests
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "AMBULANCE",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "address": "Connaught Place, New Delhi",
  "description": "Heart attack emergency",
  "requiresSecurity": false
}
```

**Response:**
```json
{
  "message": "Emergency request created",
  "request": {
    "id": "uuid",
    "type": "AMBULANCE",
    "status": "PENDING",
    "estimatedTime": 8,
    "distance": 2.5
  },
  "nearbyProviders": [...]
}
```

### Get Request
```http
GET /requests/:id
Authorization: Bearer <token>
```

### Get User Requests
```http
GET /requests/user/me?status=PENDING
Authorization: Bearer <token>
```

### Cancel Request
```http
POST /requests/:id/cancel
Authorization: Bearer <token>
```

---

## 🚑 Provider Endpoints

### Register as Provider
```http
POST /providers/register
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "serviceType": "AMBULANCE",
  "vehicleNumber": "DL-01-AB-1234",
  "licenseNumber": "DL1234567890"
}
```

### Update Provider Status
```http
PUT /providers/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "ONLINE"
}
```

### Update Location
```http
POST /providers/location
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "latitude": 28.7041,
  "longitude": 77.1025,
  "speed": 40,
  "accuracy": 10
}
```

### Accept Request
```http
POST /providers/accept
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "requestId": "uuid"
}
```

---

## 🤖 AI First-Aid Endpoints

### Analyze Injury
```http
POST /ai/analyze-injury
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "image": "base64-encoded-image"
}
```

**Response:**
```json
{
  "analysis": {
    "injuryType": "BLEEDING",
    "confidence": 0.85,
    "severity": "HIGH",
    "autoCall911": false
  },
  "firstAid": {
    "title": "Bleeding Control",
    "steps": [...]
  }
}
```

### Get First-Aid Steps
```http
GET /ai/first-aid/:injuryType
```

---

## 👨‍💼 Admin Endpoints

### Get Dashboard Stats
```http
GET /admin/stats
Authorization: Bearer <token> (Admin only)
```

**Response:**
```json
{
  "stats": {
    "activeEmergencies": 5,
    "availableProviders": 12,
    "avgResponseTime": 8,
    "weeklyRequests": 234
  }
}
```

### Get All Requests
```http
GET /admin/requests?status=PENDING&type=AMBULANCE&limit=100
Authorization: Bearer <token> (Admin only)
```

### Get All Providers
```http
GET /admin/providers?serviceType=AMBULANCE&status=ONLINE
Authorization: Bearer <token> (Admin only)
```

### Verify Provider
```http
PUT /admin/providers/:id/verify
Authorization: Bearer <token> (Admin only)
```

**Request Body:**
```json
{
  "isVerified": true
}
```

---

## 🔌 WebSocket Events

### Client → Server

**Authenticate:**
```javascript
socket.emit('authenticate', {
  userId: 'uuid',
  role: 'CITIZEN',
  providerId: 'uuid' // For providers
});
```

**Join Request Room:**
```javascript
socket.emit('join_request', requestId);
```

**Provider Location Update:**
```javascript
socket.emit('provider:location_update', {
  providerId: 'uuid',
  latitude: 28.7041,
  longitude: 77.1025,
  requestId: 'uuid'
});
```

### Server → Client

**New Request (to providers):**
```javascript
socket.on('new_request', (request) => {
  // Handle new emergency request
});
```

**Request Updated:**
```javascript
socket.on('request_updated', (update) => {
  // Handle status update
});
```

**Provider Location Update:**
```javascript
socket.on('provider_location_update', (location) => {
  // Update map with provider location
});
```

**ETA Update:**
```javascript
socket.on('eta_update', (eta) => {
  // Update estimated time
});
```

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": [] // Optional validation details
}
```

**Common Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔄 Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Response Header**: `X-RateLimit-Remaining`

---

## 📊 Response Times

Average API response times:
- Simple queries: < 50ms
- Geospatial queries: < 200ms
- AI analysis: < 3s
- Image upload: < 5s

---

For more details, see the [main README](../README.md).
