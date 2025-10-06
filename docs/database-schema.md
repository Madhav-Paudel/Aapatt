# Database Schema Documentation

## Overview
This document describes the database schema for the Aapatt emergency response system. The database is designed to handle emergency requests, provider management, real-time tracking, AI analysis, and notifications.

## Schema Diagram

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    User     │    │  EmergencyRequest│    │   Provider      │
├─────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)     │───▶│ citizenId (FK)  │◄───│ id (PK)         │
│ phone       │    │ assignedProvider│    │ userId (FK)     │
│ name        │    │ type            │    │ type            │
│ role        │    │ status          │    │ vehicleNumber   │
│ isVerified  │    │ location        │    │ licenseNumber   │
│ fcmToken    │    │ description     │    │ currentLocation │
└─────────────┘    │ isSecurityAlert │    │ status          │
                   │ estimatedArrival│    │ isOnline        │
                   └─────────────────┘    └─────────────────┘
```

## Tables

### 1. Users
Core user table for authentication and basic information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| phone | String | Unique phone number for OTP login |
| name | String | User's full name |
| role | Enum | CITIZEN, PROVIDER, ADMIN, SECURITY |
| isVerified | Boolean | Phone verification status |
| fcmToken | String | Firebase Cloud Messaging token |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### 2. Providers
Emergency service providers (ambulance, fire, air ambulance).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to Users table |
| type | Enum | AMBULANCE, FIRE_BRIGADE, AIR_AMBULANCE |
| vehicleNumber | String | Vehicle registration number |
| licenseNumber | String | Driver/pilot license number |
| currentLat | Float | Current latitude |
| currentLng | Float | Current longitude |
| currentAddress | String | Human-readable current address |
| status | Enum | OFFLINE, AVAILABLE, BUSY |
| isOnline | Boolean | Online status toggle |

### 3. EmergencyRequest
Core emergency requests from citizens.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| citizenId | UUID | Foreign key to Users table |
| type | Enum | Type of emergency service needed |
| status | Enum | PENDING, ASSIGNED, ACCEPTED, ENROUTE, ARRIVED, COMPLETED, CANCELLED |
| locationLat | Float | Emergency location latitude |
| locationLng | Float | Emergency location longitude |
| locationAddress | String | Human-readable address |
| locationLandmark | String | Nearby landmark |
| description | String | Additional details from user |
| isSecurityAlert | Boolean | Whether to alert security personnel |
| assignedProviderId | UUID | Foreign key to Providers table |
| estimatedArrival | DateTime | ETA calculated by system |

### 4. RequestStatusUpdate
History of status changes for audit trail.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| requestId | UUID | Foreign key to EmergencyRequest |
| status | Enum | New status being set |
| notes | String | Optional notes about the update |
| createdAt | DateTime | When status was changed |

### 5. LocationUpdate
Real-time location tracking for providers.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| providerId | UUID | Foreign key to Providers table |
| latitude | Float | GPS latitude |
| longitude | Float | GPS longitude |
| address | String | Reverse-geocoded address |
| speed | Float | Current speed (km/h) |
| heading | Float | Direction of movement (degrees) |
| accuracy | Float | GPS accuracy (meters) |
| createdAt | DateTime | Location timestamp |

### 6. AIAnalysis
AI-powered first aid analysis results.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| requestId | UUID | Optional link to emergency request |
| imageUrl | String | URL of analyzed image |
| condition | Enum | BLEEDING, CHOKING, CPR_NEEDED, BURNS, FRACTURE, UNCONSCIOUS, UNKNOWN |
| confidence | Float | AI confidence score (0-1) |
| firstAidSteps | String[] | Array of first aid instructions |
| videoUrl | String | URL to instructional video |
| isEmergency | Boolean | Whether immediate emergency call needed |

### 7. Notification
Push notification history.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to Users table |
| title | String | Notification title |
| body | String | Notification message |
| data | JSON | Additional structured data |
| isRead | Boolean | Read status |
| sentAt | DateTime | When notification was sent |

## Indexes

### Performance Indexes
- `providers(type, status, isOnline)` - For finding available providers
- `emergency_requests(status, createdAt)` - For active requests
- `location_updates(providerId, createdAt)` - For location history
- `notifications(userId, isRead)` - For user notifications

### Spatial Indexes (PostGIS)
- `providers(currentLat, currentLng)` - For geospatial queries
- `emergency_requests(locationLat, locationLng)` - For location-based matching

## Common Queries

### Find Nearest Available Providers
```sql
SELECT p.*, u.name, u.phone,
  ST_Distance(
    ST_Point(p.currentLng, p.currentLat),
    ST_Point($requestLng, $requestLat)
  ) as distance
FROM providers p
JOIN users u ON p.userId = u.id
WHERE p.type = $emergencyType
  AND p.status = 'AVAILABLE'
  AND p.isOnline = true
ORDER BY distance
LIMIT 5;
```

### Get Active Requests for Provider
```sql
SELECT er.*, u.name as citizenName, u.phone as citizenPhone
FROM emergency_requests er
JOIN users u ON er.citizenId = u.id
WHERE er.assignedProviderId = $providerId
  AND er.status IN ('ASSIGNED', 'ACCEPTED', 'ENROUTE', 'ARRIVED');
```

### Recent Location History
```sql
SELECT latitude, longitude, address, createdAt
FROM location_updates
WHERE providerId = $providerId
  AND createdAt >= NOW() - INTERVAL '1 hour'
ORDER BY createdAt DESC;
```

## Migration Strategy

### Phase 1: Core Tables
1. Create Users, Providers, EmergencyRequest tables
2. Set up basic relationships and constraints
3. Add essential indexes

### Phase 2: Tracking & History
1. Add LocationUpdate and RequestStatusUpdate tables
2. Set up location indexing for spatial queries
3. Add cascade delete rules

### Phase 3: AI & Notifications
1. Add AIAnalysis table for first aid features
2. Add Notification table for push messaging
3. Optimize indexes for performance

## Backup Strategy

### Daily Backups
- Full database backup to cloud storage
- Point-in-time recovery enabled
- Critical tables backed up every 6 hours

### Data Retention
- Location updates: 30 days
- Completed requests: 1 year  
- User data: Indefinite (with user consent)
- Logs: 90 days