# 🚨 Appat - Emergency Response System

**Connecting Lives in Crisis** - A comprehensive emergency response platform that bridges the gap between citizens in need and emergency service providers through intelligent technology and real-time coordination.

[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue)](https://expo.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-Dashboard-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-orange)](https://clerk.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

Appat is a revolutionary emergency response system designed to streamline emergency services through:

- **Mobile Applications** for both Emergency Service Providers (ESP) and Citizens
- **Real-time Coordination** between service providers and those in need
- **AI-Powered First Aid** assistance using computer vision
- **Live Location Tracking** for optimal response times
- **Administrative Dashboard** for higher authority oversight

### 🎭 User Roles

#### 👥 **Emergency Service Providers (ESP)**
Professional emergency responders including ambulance drivers, fire brigade personnel, and air ambulance crews.

#### 👤 **Citizens/Users**
Individuals who need emergency services and access to first aid assistance.

#### 👨‍💼 **Higher Authority Administrators**
Government or organizational authorities who manage and approve service providers.

## ✨ Features

### 🚑 For Emergency Service Providers (ESP)

#### 📝 **Provider Registration & Approval**
- Self-registration with vehicle and service details
- Approval workflow managed by higher authority
- Document verification and background checks

#### 📊 **ESP Dashboard**
- **Vehicle Management**: Track and update vehicle information, status, and maintenance
- **Emergency Notifications**: Real-time alerts for new emergency calls
- **Call Management**: Accept/decline emergency requests with instant feedback
- **Location Tracking**: Real-time GPS tracking during active emergencies

#### 🔔 **Smart Notifications**
- Push notifications for new emergency requests
- Priority-based alerts (critical, urgent, normal)
- Customizable notification preferences

### 👤 For Citizens/Users

#### 🚨 **Emergency Services**
Choose from three specialized services:
- **🚑 Ambulance**: Ground medical emergency response
- **🔥 Fire Brigade**: Fire emergency and rescue operations
- **🚁 Air Ambulance**: Aerial medical evacuation for remote areas

#### 📍 **Location Services**
- Automatic GPS location detection
- Manual location override when needed
- Real-time location sharing during emergencies

#### 🤖 **AI First Aid Assistant**
- **Camera-Based Injury Analysis**: Point camera at wounds/injuries
- **Real-time AI Feedback**: Instant injury assessment and severity classification
- **First Aid Instructions**: Step-by-step guidance for immediate care
- **Emergency Suggestions**: When to seek professional help

#### 📱 **Emergency Request Flow**
1. **Service Selection**: Choose ambulance, fire brigade, or air ambulance
2. **Additional Options**: Popup to include police assistance and instant messaging
3. **Live Tracking**: Real-time map showing ESP and user locations
4. **Auto/Manual Closure**: Automatic closure when parties are nearby, or manual override

### 👨‍💼 For Higher Authority

#### 🎛️ **Administrative Dashboard**
- **Provider Management**: Review and approve ESP registrations
- **Emergency Oversight**: Monitor active emergencies across the region
- **Analytics & Reporting**: Response times, success rates, coverage areas
- **System Configuration**: Manage service areas, emergency protocols

## 🛠️ Tech Stack

### 📱 **Mobile Application**
- **Framework**: React Native with Expo
- **Authentication**: Clerk
- **Maps**: Google Maps Platform
- **Notifications**: Expo Notifications
- **State Management**: Context API / Redux Toolkit

### 🖥️ **Administrative Dashboard**
- **Framework**: Next.js 14+
- **Styling**: Tailwind CSS
- **Charts**: Chart.js / Recharts
- **Authentication**: Clerk

### 🗄️ **Backend & Database**
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage
- **Authentication**: Clerk (integrated with Supabase)

### 🤖 **AI & Computer Vision**
- **Platform**: Google AI / Hugging Face
- **Models**: Vision Transformer for injury analysis
- **Processing**: Real-time image analysis and classification

### 🔔 **Notification System**
- **Mobile**: Expo Notifications
- **Database Triggers**: Supabase Edge Functions
- **Real-time Updates**: WebSocket connections

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile Apps   │    │ Admin Dashboard │    │   AI Services   │
│  (React Native) │    │    (Next.js)    │    │ (Google AI/HF)  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       Supabase         │
                    │   (Database & APIs)    │
                    └────────────────────────┘
```

### 🔄 **Data Flow**

1. **Emergency Request**: User → Mobile App → Supabase → ESP Notifications
2. **Provider Response**: ESP → Mobile App → Supabase → User Updates
3. **Location Tracking**: GPS → Mobile Apps → Supabase → Real-time Maps
4. **AI Analysis**: Camera → Mobile App → AI Service → First Aid Guidance
5. **Admin Oversight**: Dashboard → Supabase → Provider/User Management

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **Expo CLI** for mobile development
- **Supabase** account and project
- **Clerk** account for authentication
- **Google Maps API** key
- **Google AI/Hugging Face** API access

### 🔑 Environment Variables

Create `.env.local` files in respective directories:

#### Mobile App (citizen-app/.env.local)
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_AI_API_KEY=your_ai_api_key
```

#### ESP App (esp-app/.env.local)
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

#### Admin Dashboard (admin-dashboard/.env.local)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/appat.git
cd appat
```

### 2. Install Dependencies

#### Mobile Apps
```bash
# Citizen App
cd citizen-app
npm install

# ESP App
cd ../esp-app
npm install
```

#### Admin Dashboard
```bash
cd ../admin-dashboard
npm install
```

### 3. Database Setup

#### Supabase Configuration
1. Create a new Supabase project
2. Run the SQL migrations in `supabase/migrations/`
3. Configure authentication providers
4. Set up storage buckets for images/documents
5. Configure real-time subscriptions

#### Key Tables
- `users` - Citizen and ESP profiles
- `emergency_requests` - Emergency service requests
- `service_providers` - ESP information and status
- `vehicles` - Vehicle information and tracking
- `emergency_logs` - Historical emergency data

### 4. Authentication Setup

#### Clerk Configuration
1. Create Clerk application
2. Configure sign-in/sign-up flows
3. Set up user roles and permissions
4. Configure social providers (optional)

### 5. AI Service Setup

#### Google AI / Hugging Face
1. Obtain API keys
2. Configure vision models for injury analysis
3. Set up rate limiting and error handling
4. Test AI endpoints with sample images

## 🎮 Usage

### 👤 **For Citizens**

1. **Download & Install**: Get the Appat app from app stores
2. **Sign Up/Login**: Create account using phone/email
3. **Grant Permissions**: Allow location and camera access
4. **Emergency Request**:
   - Open app and tap emergency service button
   - Select service type (ambulance/fire/air ambulance)
   - Add police assistance or instant messaging if needed
   - Confirm request
5. **Live Tracking**: Monitor ESP approach on map
6. **First Aid**: Use camera for injury analysis and guidance

### 🚑 **For Emergency Service Providers**

1. **Registration**: Sign up and submit for approval
2. **Wait for Approval**: Higher authority reviews application
3. **Dashboard Access**: Login to ESP dashboard
4. **Vehicle Setup**: Add and configure vehicles
5. **Receive Calls**: Get notifications for emergency requests
6. **Accept/Decline**: Respond to emergency calls
7. **Location Tracking**: Enable GPS during active emergencies

### 👨‍💼 **For Administrators**

1. **Dashboard Login**: Access admin panel
2. **Provider Management**: Review and approve ESP applications
3. **Emergency Monitoring**: Track active emergencies
4. **Analytics**: View response times and success metrics
5. **System Management**: Configure service areas and protocols

## 📚 API Documentation

### 🔗 **Supabase Edge Functions**

#### Emergency Management
- `POST /functions/create-emergency` - Create new emergency request
- `PUT /functions/update-emergency-status` - Update emergency status
- `GET /functions/nearby-providers` - Find nearby service providers

#### Provider Management
- `POST /functions/register-provider` - Register new ESP
- `PUT /functions/update-provider-status` - Update provider availability
- `GET /functions/provider-dashboard` - Get provider dashboard data

#### AI Services
- `POST /functions/analyze-injury` - Analyze injury from image
- `GET /functions/first-aid-instructions` - Get first aid guidance

### 📱 **Mobile App APIs**

#### Authentication
- Clerk SDK for user management
- Role-based access control

#### Real-time Features
- Supabase real-time subscriptions
- WebSocket connections for live tracking

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- **React Native**: Follow Expo and React Native best practices
- **Next.js**: Use TypeScript and follow Next.js conventions
- **Database**: Use Supabase best practices for queries and RLS
- **Testing**: Write unit and integration tests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs.appat.com](https://docs.appat.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/appat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/appat/discussions)
- **Email**: support@appat.com

## 🙏 Acknowledgments

- **Emergency Services Community** for their invaluable input
- **Open Source Contributors** for their dedication
- **AI Research Community** for computer vision advancements
- **Mapping Services** for location technology

---

**Appat** - Because in emergencies, every second counts. Together, we can save more lives. 🚨❤️