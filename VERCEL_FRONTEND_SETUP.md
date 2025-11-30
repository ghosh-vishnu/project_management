# Vercel Frontend Setup Guide

आपका frontend Vercel पर deployed है और backend Render पर deploy होगा।

## 🌐 URLs

- **Frontend (Vercel):** `https://project-management-1bt6.vercel.app`
- **Backend (Render):** `https://your-app-name.onrender.com` (deploy के बाद)

## ✅ CORS Configuration

Vercel frontend URL को backend में configure किया गया है:

### settings.py में:
```python
CORS_ALLOWED_ORIGINS = [
    'https://project-management-1bt6.vercel.app',  # Vercel frontend
    'http://localhost:5173',  # Local development
    # ... other origins
]
```

## 🔧 Render Environment Variables

Render dashboard में निम्नलिखित environment variable set करें:

```
FRONTEND_URL=https://project-management-1bt6.vercel.app
```

या CORS_ALLOWED_ORIGINS में directly:

```
CORS_ALLOWED_ORIGINS=https://project-management-1bt6.vercel.app,http://localhost:5173
```

## 📱 Frontend Configuration

Frontend में API base URL को Render backend URL point करना होगा:

### Example (frontend code में):
```javascript
// Production
const API_BASE_URL = 'https://your-app-name.onrender.com/api';

// Development
// const API_BASE_URL = 'http://localhost:8000/api';
```

## ✅ Testing

Deploy के बाद test करें:

1. **Frontend से API call:**
   - Vercel frontend: `https://project-management-1bt6.vercel.app`
   - Login करने की कोशिश करें
   - Browser console में CORS errors check करें

2. **CORS Test:**
   ```bash
   curl -H "Origin: https://project-management-1bt6.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: X-Requested-With" \
        -X OPTIONS \
        https://your-app-name.onrender.com/api/
   ```

## 🐛 Common Issues

### CORS Error
- **Problem:** Browser में CORS error दिख रहा है
- **Solution:** 
  - Check करें कि `FRONTEND_URL` environment variable set है
  - `CORS_ALLOWED_ORIGINS` में Vercel URL include है
  - Backend logs में CORS errors check करें

### API Connection Failed
- **Problem:** Frontend से API call fail हो रहा है
- **Solution:**
  - Frontend में API base URL correct है
  - Render backend URL accessible है
  - Network tab में request details check करें

## 📝 Checklist

- [x] Vercel frontend URL configured in settings.py
- [ ] Render backend deployed
- [ ] `FRONTEND_URL` environment variable set in Render
- [ ] Frontend API base URL updated to Render backend
- [ ] CORS working (no browser errors)
- [ ] Login functionality tested
- [ ] API calls working from frontend

---

**Note:** Frontend और backend दोनों deploy होने के बाद, frontend में API base URL को Render backend URL से update करना न भूलें!

