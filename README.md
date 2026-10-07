# 🍽️ Restaurant Reservation & Management System

A modern, full-stack dining reservation and floor management web application built with **React 19, Vite, Tailwind CSS, Node.js, Express, and MongoDB**.

---

## ✨ Features

- **Interactive Architectural Floor Plan**: Visual real-time dining room layout showcasing table capacities, ambience zones (Window Terrace, Chandelier Hall, VIP Salons), and seat availability.
- **Strict Double-Booking Prevention**: Backend validation ensures no two parties can reserve the same table at the same time slot.
- **Comprehensive Guest Booking Flow**: Select date, time slot, party size, pick specific table, add dietary/special requests, and receive an instant booking voucher.
- **Digital Booking Receipts**: Downloadable, printable reservation receipt voucher with booking reference code and formatted ticket.
- **Full Admin Management Panel**:
  - **Overview**: Real-time statistics on reservations, confirmed parties, tables, and customers.
  - **Reservations**: Live operational run-sheet, filter by date/status, instant status toggles (Confirmed, Checked In, Completed, Cancelled), and 1-click CSV export.
  - **Table Management**: Add, update, set maintenance status, or delete dining tables.
  - **Menu & Category Management**: Dynamic food catalog with pricing, categories, dish descriptions, and real-time availability toggles.
  - **1-Click Database Seeding**: Populate default tables, categories, and gourmet dishes instantly.
- **Authentication & Security**: Secure JWT authentication with role-based access control (Admin & Customer), hashed passwords with bcrypt.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (or provide your cloud URI in `backend/.env`)

### 2. Install All Dependencies
From the root project directory:
```bash
npm run install:all
```
*(Or install separately with `npm install` inside both `backend/` and `frontend/`)*

### 3. Seed the Database
Populate initial dining tables, categories, menu items, and admin credentials:
```bash
npm run seed
```

### 4. Start the Application
Run both backend and frontend development servers concurrently:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Default Seed Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator** | `admin@restaurant.com` | `admin123` | Full Admin Dashboard (`/admin`), Table & Menu Management |
| **Customer / Guest** | `guest@example.com` | `password123` | Table Reservation (`/reserve`), Profile & Booking History (`/profile`) |

*You can also create a new account anytime on the [Register](http://localhost:5173/register) page.*

---

## 🛠️ VS Code Debugging & Launching

The project is fully configured for VS Code debugging in [`.vscode/launch.json`](file:///.vscode/launch.json) and [`.vscode/tasks.json`](file:///.vscode/tasks.json):

1. Open the project in VS Code.
2. Press `Ctrl + Shift + D` (or `Cmd + Shift + D`) to open the **Run & Debug** tab.
3. Select **"Full Stack (Backend + Frontend)"** and press `F5`:
   - Automatically starts the backend server in the integrated terminal.
   - Automatically runs the Vite dev server in the background via `preLaunchTask`.
   - Opens Google Chrome connected to `http://localhost:5173` with breakpoints enabled.

---

## 📁 Project Architecture

```
Restaurant Reservation System/
├── .vscode/
│   ├── launch.json              # VS Code run & debug configurations
│   └── tasks.json               # Automated dev server tasks
├── backend/
│   ├── config/db.js             # Mongoose connection handler
│   ├── controllers/             # Auth, User, Table, Menu, Reservation, Admin logic
│   ├── middleware/              # JWT authorization & role verification
│   ├── models/                  # Mongoose models (User, Table, MenuCategory, MenuItem, Reservation)
│   ├── routes/                  # Express API route endpoints
│   ├── seed.js                  # Database initial data seeder
│   ├── server.js                # Express entrypoint & server setup
│   └── .env                     # Server environment variables
├── frontend/
│   ├── src/
│   │   ├── components/          # FloorPlan, BookingReceiptModal, Navbar, Footer, ProtectedRoute
│   │   ├── context/             # AuthContext (login, register, token session sync)
│   │   ├── pages/               # Home, Menu, Reserve, Admin, Profile, Login, Register
│   │   ├── services/            # Axios API instance with JWT interceptor
│   │   └── App.jsx              # Client routing & layout wrapper
│   ├── tailwind.config.js       # Styling configuration
│   └── vite.config.js           # Vite config with backend proxy (/api -> localhost:5000)
├── package.json                 # Root script runner (concurrent dev, seed, build)
└── README.md
```

---

## 🧪 Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `concurrently ...` | Runs both backend (port 5000) and frontend (port 5173) |
| `npm run dev:backend` | `npm run dev --prefix backend` | Runs backend with nodemon |
| `npm run dev:frontend` | `npm run dev --prefix frontend` | Runs Vite frontend dev server |
| `npm run seed` | `npm run seed --prefix backend` | Seeds database with tables, menu items & accounts |
| `npm run build` | `npm run build --prefix frontend` | Builds optimized frontend bundle |
| `npm run install:all` | Multiple `npm install` | Installs dependencies for root, backend, and frontend |
