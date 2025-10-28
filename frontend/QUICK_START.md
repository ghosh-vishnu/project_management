# Quick Start Guide

## How to Run the Project

### 1. Backend (Already Running)
```powershell
cd backend\project_management
python manage.py runserver
```
Runs on: http://127.0.0.1:8000

### 2. Frontend (Restart Required)
```powershell
cd frontend
npm run dev
```
Runs on: http://localhost:5173

## Test Login
- **Email:** test@test.com
- **Password:** test123

## If You See "BASE_API_URL: undefined"

1. Make sure `.env` file exists in `frontend/` folder
2. Restart the frontend dev server:
   - Press `Ctrl+C` to stop
   - Run `npm run dev` again

## Files Fixed
✅ `frontend/src/data.js` - Added fallback URL
✅ `frontend/.env` - Environment variable configured
✅ Login endpoint updated to `/api/auth/login/`

## Troubleshooting

### Still seeing undefined?
Check `.env` file content:
```
VITE_API_URL=http://127.0.0.1:8000/api
```

### Backend not responding?
```powershell
cd backend\project_management
python manage.py runserver
```

### CORS errors?
Make sure backend has CORS configured in `settings.py`

---

**The login page should now work!** 🎉

