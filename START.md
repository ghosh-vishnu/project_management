# 🚀 Quick Start Guide

## 📁 Current Structure

```
d:\Project_Ved\project_management\
├── backend/                    # Django Backend
│   ├── project_management/    # Your Django project
│   │   ├── manage.py
│   │   ├── db.sqlite3
│   │   └── ... (all apps)
│   ├── requirements.txt
│   └── README.md
│
├── frontend/                   # Frontend (empty - you'll setup)
│   └── README.md
│
├── venv/                      # Python Virtual Environment
├── Project_Status_and_Trend_Tracker.xlsx
└── README.md
```

## 🎯 How to Run Backend

### Prerequisites: Setup PostgreSQL First
See `backend/POSTGRESQL_SETUP.md` for detailed instructions.

Quick steps:
1. Install PostgreSQL
2. Create database: `CREATE DATABASE project_management;`
3. Update `settings.py` with your PostgreSQL credentials

### Step 1: Activate Virtual Environment
```powershell
.\venv\Scripts\activate
```

### Step 2: Install Dependencies
```powershell
pip install -r backend/requirements.txt
```

### Step 3: Configure Database
Edit `backend/project_management/project_management/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'project_management',
        'USER': 'postgres',
        'PASSWORD': 'your_password',  # Change this
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Step 4: Run Migrations
```powershell
cd backend\project_management
python manage.py migrate
```

### Step 5: Run the Server
```powershell
python manage.py runserver
```

### Step 6: Open in Browser
- Admin Panel: http://127.0.0.1:8000/admin/
- API: http://127.0.0.1:8000/api/projects/

---

## 🎨 How to Setup Frontend

### Option 1: React with Vite (Recommended)
```powershell
cd frontend
npm create vite@latest . -- --template react
npm install
npm run dev
```

### Option 2: Next.js
```powershell
cd frontend
npx create-next-app@latest .
npm install
npm run dev
```

### Option 3: Vue.js
```powershell
cd frontend
npm create vue@latest .
npm install
npm run dev
```

### Option 4: Plain HTML/CSS/JS
Just create your HTML files in the `frontend/` folder.

---

## 📊 Track Your Progress

Open: `Project_Status_and_Trend_Tracker.xlsx`

This Excel file contains:
- ✅ Module-wise progress
- 📅 Estimated completion dates
- 🎯 Priority tracking
- 📈 Overall project status

---

## 💡 Tips

1. **Backend API** is ready and running
2. **Frontend** - Choose your favorite framework
3. **Excel Tracker** - Update progress regularly
4. Keep `venv/` activated while working on backend

---

## 🔗 Useful Commands

### Backend Commands
```powershell
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files (for production)
python manage.py collectstatic

# Run tests
python manage.py test
```

### Frontend Commands (after setup)
```powershell
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Production build
```

---

## 📞 Need Help?

Check the README files:
- `README.md` - Main project overview
- `backend/README.md` - Backend documentation
- `frontend/README.md` - Frontend setup options

Happy Coding! 🎉

