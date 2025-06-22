# 🌍 Disaster Response Coordination Platform

Built by **Prashant Gupta – Madan Mohan Malaviya University of Technology (ECE Final Year)**  
Tech Stack: **React • Node.js • Express • Supabase • Socket.IO • PostGIS • Tailwind CSS • Gemini API (Mock)**

---

## 🚀 Setup Instructions

### 1. Prerequisites

- Node.js (v16 or above)
- PostgreSQL (with PostGIS extension enabled)
- npm or yarn
- Supabase account + project
- Git (for cloning)

---

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/disaster-response-platform.git
cd disaster-response-platform
```

---

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4. Install Backend Dependencies

```bash
cd ../backend
npm install
```

---

### 5. Configure Environment Variables

#### ➤ Create `.env` in `/backend`:

```env
PORT=5000
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
```

#### ➤ Create `.env` in `/frontend`:

```env
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

### 6. Run the Project

#### ➤ Start Backend Server

```bash
cd backend
npm run dev
```

#### ➤ Start Frontend App

```bash
cd ../frontend
npm run dev
```

---

## 📦 Folder Structure

```bash
.
├── backend
│   ├── routes/
│   ├── services/
│   ├── config/
│   └── server.js
│
├── frontend
│   ├── components/
│   └── App.tsx
└── README.md
```

---

## 🧠 Features

* ✅ Disaster creation + location parsing
* ✅ AI-powered location extraction (Gemini API - Mocked)
* ✅ Geocoding via mock Mapbox / Google Maps
* ✅ Supabase + PostGIS for geospatial queries
* ✅ Real-time resource updates via Socket.IO
* ✅ Filtered and dynamic resource listing
* ✅ Map display placeholder (supports integration)

---

## 📡 API Endpoints

### ➤ Disaster Endpoints

| Method | Endpoint       | Description           |
| ------ | -------------- | --------------------- |
| GET    | /api/disasters | Get all disasters     |
| POST   | /api/disasters | Create a new disaster |

### ➤ Report Endpoints

| Method | Endpoint     | Description             |
| ------ | ------------ | ----------------------- |
| GET    | /api/reports | Fetch reports           |
| POST   | /api/reports | Submit new field report |

### ➤ Resource Endpoints

| Method | Endpoint                      | Description                          |
| ------ | ----------------------------- | ------------------------------------ |
| GET    | /api/resources                | List resources with optional filters |
| POST   | /api/resources                | Add new resource with geocoding      |
| GET    | /api/disasters/:id/resources | Get disaster-specific resources      |

### ➤ Geocoding Endpoint

| Method | Endpoint     | Description                                 |
| ------ | ------------ | ------------------------------------------- |
| POST   | /api/geocode | Extract + geocode location from description |

---

## 🧩 Database Schema

### 📌 Disasters table

```sql
CREATE TABLE disasters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location_name TEXT,
  location GEOMETRY(Point, 4326),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 📌 Resources table

```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Shelter', 'Medical', 'Supply')),
  location_name TEXT NOT NULL,
  location GEOMETRY(Point, 4326),
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 📌 Reports table

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
  reporter TEXT NOT NULL,
  content TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧠 AI & Geo Logic

* **Mock Gemini API** for extracting location names from text
* **Mock Geocoder** simulates lat/lng conversion
* **PostGIS** for radius-based filtering and proximity searches

---

## 📍 Future Enhancements

* 🗺️ Real interactive map with markers
* 🛰️ GPS/mobile-based disaster reporting
* 🧠 Replace mocks with real Gemini + Mapbox APIs

---

