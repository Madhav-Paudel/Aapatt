# 🖥️ Aapatt Admin Dashboard - Live View

## What You're Seeing at http://localhost:5173/

### 🎨 Login Screen (First View)
```
┌────────────────────────────────────────────┐
│                                            │
│              🚨 (Large Icon)              │
│                                            │
│            Aapatt Admin                    │
│     Emergency Management Dashboard         │
│                                            │
│    ┌──────────────────────────────┐       │
│    │ Username                      │       │
│    │ [_____________________]       │       │
│    └──────────────────────────────┘       │
│                                            │
│    ┌──────────────────────────────┐       │
│    │ Password                      │       │
│    │ [_____________________]       │       │
│    └──────────────────────────────┘       │
│                                            │
│         [  Login Button - Red  ]          │
│                                            │
└────────────────────────────────────────────┘
```

### 📊 Main Dashboard (After Login)

**Left Sidebar (Dark Theme):**
- 🚨 Aapatt (Logo & Title)
- 📊 Dashboard ← Active
- 🗺️ Live Map
- 🚑 Providers
- 📈 Analytics

**Main Content Area:**

#### Stats Cards (Top Row):
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 🚨          │  │ 🚑          │  │ 📋          │  │ ⏱️          │
│ Active      │  │ Online      │  │ Today's     │  │ Avg Response│
│ Emergencies │  │ Providers   │  │ Requests    │  │ Time        │
│     5       │  │     12      │  │     23      │  │   8 min     │
│ ↘ -12%     │  │ ↗ +8%      │  │ ↗ +15%     │  │ ↘ -5%      │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

#### Recent Emergency Requests Table:
```
┌────────────────────────────────────────────────────────────────┐
│  ID      │ Type         │ Location    │ Status    │ Time       │
├──────────┼──────────────┼─────────────┼───────────┼────────────┤
│ REQ-1001 │ 🚑 Ambulance │ Downtown    │ En Route  │ 2 min ago  │
│ REQ-1002 │ 🚒 Fire      │ Uptown      │ Accepted  │ 4 min ago  │
│ REQ-1003 │ 🚁 Air Amb   │ Suburb      │ Pending   │ 6 min ago  │
│ REQ-1004 │ 🚑 Ambulance │ City Center │ Arrived   │ 8 min ago  │
│ REQ-1005 │ 🚒 Fire      │ Industrial  │ En Route  │ 10 min ago │
└────────────────────────────────────────────────────────────────┘
```

### 🗺️ Live Map Page:
- Interactive map showing:
  - 📍 Red markers: Active emergencies
  - 🚑 Blue markers: Online providers
  - Real-time movement tracking
  - ETA calculations

### 🚑 Providers Page:
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Total       │  │ Online Now  │  │ Avg Rating  │
│ Providers   │  │             │  │             │
│     5       │  │      3      │  │    4.78     │
│ 🚑         │  │ ✅         │  │ ⭐         │
└─────────────┘  └─────────────┘  └─────────────┘

Provider Table:
┌──────────────────────────────────────────────────────────┐
│ Name         │ Type       │ Vehicle  │ Status │ Rating  │
├──────────────┼────────────┼──────────┼────────┼─────────┤
│ 👤 John Doe  │ AMBULANCE  │ AMB-001  │ ONLINE │ ⭐ 4.8 │
│ 👤 Jane Smith│ FIRE       │ FIRE-001 │ ONLINE │ ⭐ 4.9 │
│ 👤 Mike J.   │ AIR AMB    │ AIR-001  │ OFFLINE│ ⭐ 4.7 │
└──────────────────────────────────────────────────────────┘
```

### 📈 Analytics Page:
- Charts showing:
  - Requests by Type (Pie Chart)
  - Response Times (Line Chart)
  - Daily Requests (Bar Chart)
  - Provider Performance (Area Chart)
