# PostgreSQL Setup Guide

## Step 1: Install PostgreSQL

### Windows
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Set a password for the `postgres` user during installation
4. Default port: `5432`

### Or Use Chocolatey
```powershell
choco install postgresql
```

## Step 2: Create Database

Open **pgAdmin** or **psql** command line and run:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE project_management;

-- Create a user (optional, if you don't want to use postgres user)
CREATE USER project_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE project_management TO project_user;

-- Exit
\q
```

Or use **pgAdmin GUI**:
1. Open pgAdmin
2. Right-click on "Databases"
3. Create → Database
4. Name: `project_management`
5. Click Save

## Step 3: Update settings.py

Edit `backend/project_management/project_management/settings.py` and update:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'project_management',
        'USER': 'postgres',              # Your PostgreSQL username
        'PASSWORD': 'your_password',     # Your PostgreSQL password
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Step 4: Install Python Package

```powershell
# Activate virtual environment
.\venv\Scripts\activate

# Install psycopg2
pip install psycopg2-binary
```

Or install all requirements:
```powershell
pip install -r backend/requirements.txt
```

## Step 5: Run Migrations

```powershell
cd backend\project_management

# Create tables
python manage.py migrate

# Create superuser (if needed)
python manage.py createsuperuser

# Run server
python manage.py runserver
```

## Step 6: Verify Connection

Open Django admin: http://127.0.0.1:8000/admin/

---

## Alternative: Using Docker (Easy Way)

If you don't want to install PostgreSQL directly:

```powershell
# Pull PostgreSQL image
docker pull postgres

# Run PostgreSQL container
docker run --name postgres-project -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=project_management -p 5432:5432 -d postgres

# Check if running
docker ps
```

Then update `settings.py` with:
- PASSWORD: `your_password`
- HOST: `localhost`
- PORT: `5432`

---

## Troubleshooting

### Connection Error
- Check if PostgreSQL service is running
- Verify username/password
- Check if database exists

### Port Conflict
- Change PostgreSQL port or Django settings

### Windows Service
```powershell
# Start PostgreSQL service
net start postgresql-x64-15

# Stop PostgreSQL service
net stop postgresql-x64-15
```

---

## Useful Commands

```sql
-- List all databases
\l

-- Connect to a database
\c project_management

-- List all tables
\dt

-- Show table structure
\d table_name

-- Exit
\q
```

## pgAdmin Commands

1. Connect to server → localhost
2. Expand Databases → project_management
3. Right-click → Query Tool
4. Run SQL queries

---

**Setup complete! Now you can use PostgreSQL as your database.** 🎉

