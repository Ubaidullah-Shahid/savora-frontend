# Savora Restaurant System — Complete MERN Project

## Folder Structure
```
savora-complete/          ← Frontend (React + TanStack Router)
savora-complete/backend/  ← Backend (Express + MongoDB)
```

## Quick Start

### Step 1 — Set up MongoDB Atlas (free)
1. Go to mongodb.com → Create free account → New Project → Build a Database (Free tier)
2. Create a user (username + password)
3. Allow IP access: 0.0.0.0/0
4. Click "Connect" → "Drivers" → copy the connection string

### Step 2 — Start Backend
```bash
cd savora-complete/backend
npm install
cp .env.example .env
# Edit .env: paste your MongoDB connection string and set a JWT secret
node server.js
# You should see:
# ✅ MongoDB connected: cluster0.xxxxx.mongodb.net
# 🚀 Server → http://localhost:5000
```

### Step 3 — Start Frontend
```bash
cd savora-complete
npm install
npm run dev
# Open: http://localhost:5173
```

## How It Works

### Auth Flow
1. User visits /auth and registers → backend creates user with role="customer"
2. Backend returns JWT token → frontend saves it in localStorage
3. On login, backend checks password → returns token + role
4. Frontend redirects: admin→/admin, staff→/staff, customer→/

### Admin/Staff Setup
To create admin or staff accounts, use Postman or MongoDB Atlas:
POST http://localhost:5000/api/auth/register
Body: { "name": "Admin", "email": "admin@savora.com", "password": "admin123", "role": "admin" }

### API Endpoints
- POST   /api/auth/register      → Create account
- POST   /api/auth/login         → Login, get token
- GET    /api/auth/me            → Get current user
- GET    /api/menu               → All menu items (public)
- POST   /api/menu               → Add item (admin)
- PUT    /api/menu/:id           → Edit item (admin)
- DELETE /api/menu/:id           → Delete item (admin)
- POST   /api/orders             → Place order (logged in)
- GET    /api/orders             → All orders (admin/staff)
- PUT    /api/orders/:id/status  → Update status (staff/admin)
- POST   /api/reservations       → Book table (public)
- GET    /api/reservations       → All reservations (admin)
