# Project Management System

Complete project management solution with separate backend and frontend.

## 📁 Project Structure

```
project_management/
├── backend/              # Django Backend API
│   └── project_management/
│       ├── manage.py
│       ├── project_management/
│       │   ├── settings.py
│       │   ├── urls.py
│       │   └── ...
│       └── apps/         # Django apps (projects, tasks, etc.)
│
├── frontend/             # Frontend Application (React/Vue/Angular)
│
├── venv/                 # Python Virtual Environment
│
├── Project_Management_System.pdf    # Project Documentation
└── Project_Status_and_Trend_Tracker.xlsx  # Progress Tracking
```

## 🚀 Quick Start

### Backend Setup

```bash
# Activate virtual environment
cd d:\Project_Ved\project_management
.\venv\Scripts\activate

# Navigate to backend
cd backend\project_management

# Run migrations (if not done)
python manage.py migrate

# Create superuser (if needed)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will run on: **http://127.0.0.1:8000**

### Frontend Setup

Navigate to `frontend/` folder and follow the README there to setup your preferred framework.

Recommended: React with Vite

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm run dev
```

## 📊 Project Modules

### Completed ✅
- Authentication & Authorization (Login, Registration)
- Projects Module (Listing, Details, CRUD)
- Company Settings
- Database Setup

### In Progress 🔄
- Password Reset
- Roles & Permissions
- Dashboard
- Project Status Management
- Task Management
- Employee Management

### Not Started 📋
- Sprint Management
- Lead & Deal Management
- Finance & Invoicing
- Reporting & Analytics
- Documentation

## 🔗 Important Links

- **Excel Tracker**: `Project_Status_and_Trend_Tracker.xlsx`
- **Backend Admin**: http://127.0.0.1:8000/admin/
- **API**: http://127.0.0.1:8000/api/projects/

## 📝 Development

### Backend (Django)
- Framework: Django 5.2.6 + Django REST Framework
- Database: SQLite3 (development)
- All modules in `backend/project_management/`

### Frontend (To be determined)
- Choose: React / Vue / Angular / Plain HTML
- Setup in `frontend/` folder

## 🛠️ Tech Stack

- **Backend**: Django + DRF
- **Database**: SQLite3
- **Frontend**: (Choose your framework)
- **API**: RESTful API

## 📧 Support

For questions or issues, refer to the project documentation PDF.

