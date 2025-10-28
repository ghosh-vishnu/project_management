# Project Management System - Backend (Django)

This is the Django backend for the Project Management System with PostgreSQL database.

## 🗄️ Database: PostgreSQL

This project uses **PostgreSQL** as the database instead of SQLite.

📖 **Setup Instructions**: See [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)

## 🚀 Quick Setup

### Step 1: Install PostgreSQL
1. Download from: https://www.postgresql.org/download/
2. Install with default settings
3. Remember your PostgreSQL password

### Step 2: Create Database
```sql
CREATE DATABASE project_management;
```

### Step 3: Activate Virtual Environment
```powershell
cd d:\Project_Ved\project_management
.\venv\Scripts\activate
```

### Step 4: Install Dependencies
```powershell
pip install -r backend/requirements.txt
```

### Step 5: Update Database Settings
Edit `backend/project_management/project_management/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'project_management',
        'USER': 'postgres',            # Your PostgreSQL username
        'PASSWORD': 'your_password',   # Your PostgreSQL password
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Step 6: Run Migrations
```powershell
cd backend\project_management
python manage.py migrate
```

### Step 7: Create Superuser (Optional)
```powershell
python manage.py createsuperuser
```

### Step 8: Run Server
```powershell
python manage.py runserver
```

## 📍 Access Points

- **Admin Panel**: http://127.0.0.1:8000/admin/
- **API**: http://127.0.0.1:8000/api/
- **Projects API**: http://127.0.0.1:8000/api/projects/

## 📂 Project Structure

```
backend/
├── project_management/          # Main Django project
│   ├── manage.py
│   ├── project_management/
│   │   ├── settings.py          # Database configuration here
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   └── [apps]/                  # All Django apps
├── requirements.txt             # Python dependencies
├── POSTGRESQL_SETUP.md          # PostgreSQL setup guide
└── README.md                    # This file
```

## 🛠️ Available Commands

```powershell
# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Run tests
python manage.py test

# Open Django shell
python manage.py shell

# Check for issues
python manage.py check
```

## 📦 Dependencies

- **Django** 5.2.6
- **Django REST Framework** 3.16.1
- **psycopg2-binary** 2.9.9 (PostgreSQL adapter)
- **Pillow** 10.0.0 (Image handling)
- **python-decouple** 3.8 (Environment variables)

## 🗃️ Database Management

### Access PostgreSQL
```sql
-- Connect
psql -U postgres

-- List databases
\l

-- Connect to database
\c project_management

-- List tables
\dt
```

### Using pgAdmin
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Navigate to Databases → project_management

## 🔧 Configuration

### Database Settings (settings.py)
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'project_management',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Environment Variables (Optional)
Create `.env` file in `backend/` directory:
```
DB_NAME=project_management
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

## 🐳 Using Docker (Alternative)

If you prefer Docker for PostgreSQL:

```powershell
# Run PostgreSQL in Docker
docker run --name postgres-project -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=project_management -p 5432:5432 -d postgres

# Verify
docker ps
```

## 🆘 Troubleshooting

### Can't Connect to Database
- Check if PostgreSQL service is running
- Verify username/password in settings.py
- Ensure database exists

### Migration Errors
- Delete old migrations (keep __init__.py)
- Run `python manage.py migrate` again

### Port Already in Use
- Change PostgreSQL port or Django settings

## 📝 Notes

- PostgreSQL is more powerful than SQLite for production
- Better for concurrent access
- Supports advanced features
- Required for hosting platforms like Heroku, Railway, etc.

---

**For detailed setup instructions, see [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)**
