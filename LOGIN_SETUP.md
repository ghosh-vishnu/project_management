# 🔐 Login Setup Complete!

## ✅ What's Been Setup

### Backend (Django)
- ✅ PostgreSQL database configured
- ✅ Authentication app created
- ✅ Token-based authentication enabled
- ✅ CORS headers configured for frontend
- ✅ Login & Register endpoints ready

### Frontend (React)
- ✅ Login page updated
- ✅ API endpoint configured
- ✅ Environment variables set

## 🚀 How to Run

### Step 1: Start Backend
```powershell
cd backend\project_management
python manage.py runserver
```
Server runs on: **http://127.0.0.1:8000**

### Step 2: Start Frontend
Open a new terminal:
```powershell
cd frontend
npm run dev
```
Frontend runs on: **http://localhost:5173**

## 🔑 Test Credentials

**Test User:**
- **Email:** test@test.com
- **Password:** test123

## 📍 API Endpoints

### Login
- **URL:** http://127.0.0.1:8000/api/auth/login/
- **Method:** POST
- **Body:**
```json
{
  "email": "test@test.com",
  "password": "test123"
}
```

### Register
- **URL:** http://127.0.0.1:8000/api/auth/register/
- **Method:** POST
- **Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "first_name": "New",
  "last_name": "User"
}
```

## 🎯 What Happens on Login

1. User enters email and password
2. Frontend sends POST request to `/api/auth/login/`
3. Backend authenticates the user
4. Returns a token (accesToken)
5. Token is stored in localStorage
6. User is redirected to dashboard

## 🔧 Configuration Files

### Backend
- **Settings:** `backend/project_management/project_management/settings.py`
- **URLs:** `backend/project_management/project_management/urls.py`
- **Auth Views:** `backend/project_management/authentication/views.py`
- **Database:** PostgreSQL - `project_management` database

### Frontend
- **Environment:** `frontend/.env` (VITE_API_URL)
- **Login Page:** `frontend/src/pages/Login.jsx`
- **Token Management:** `frontend/src/Token.js`

## 🐛 Troubleshooting

### "Password authentication failed"
- Check PostgreSQL password in `settings.py` (line 83)
- Make sure PostgreSQL service is running

### "CORS Error"
- Check CORS_ALLOWED_ORIGINS in settings.py
- Make sure django-cors-headers is installed

### "Invalid credentials"
- Use: test@test.com / test123
- Or create a new user via register endpoint

### Frontend not connecting
- Check if backend is running on port 8000
- Verify .env file has correct API URL
- Check browser console for errors

## 📝 Create New Users

### Via Django Admin
```powershell
python manage.py createsuperuser
```
Then visit: http://127.0.0.1:8000/admin/

### Via API (Register Endpoint)
Send POST request to: http://127.0.0.1:8000/api/auth/register/

### Via Django Shell
```powershell
python manage.py shell
>>> from django.contrib.auth.models import User
>>> user = User.objects.create_user('username', 'email@example.com', 'password')
```

## 🎉 Next Steps

1. ✅ Login page is working
2. Next: Set up protected routes
3. Next: Add logout functionality
4. Next: Build dashboard components
5. Next: Connect projects module

## 📚 Useful Commands

```powershell
# Check running migrations
python manage.py showmigrations

# Create migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Access Django shell
python manage.py shell

# Check for issues
python manage.py check
```

---

**Setup Complete! Try logging in now!** 🎊

