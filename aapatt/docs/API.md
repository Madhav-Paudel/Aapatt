# API Overview

Base URL: `/api`

## Auth
- POST `/auth/provider/login` — phone OTP verify (Firebase)

## Requests
- POST `/requests` — create emergency request
- POST `/requests/:id/accept` — provider accepts
- GET `/requests/:id` — get request status

## Providers
- GET `/providers/nearby` — list available providers near location
- PATCH `/providers/:id/status` — set online/offline

## Sockets
- `request:created` — emitted when citizen creates request
- `request:accepted` — provider accepted
- `provider:location` — live location updates
