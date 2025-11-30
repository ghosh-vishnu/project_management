# Render Deployment Guide

यह guide आपको Render पर Django application deploy करने में मदद करेगा।

## 📋 Prerequisites

1. Render account (https://render.com)
2. GitHub repository में code push किया हुआ होना चाहिए

## 🚀 Deployment Steps

### Step 1: Render पर New Web Service बनाएं

1. Render dashboard में जाएं
2. "New +" button पर click करें
3. "Web Service" select करें
4. अपना GitHub repository connect करें

### Step 2: Build & Start Commands Setup

Render में निम्नलिखित settings configure करें:

**Build Command:**
```bash
chmod +x build.sh && ./build.sh
```

**Start Command:**
```bash
cd backend/project_management && gunicorn project_management.wsgi:application --bind 0.0.0.0:$PORT
```

### Step 3: Environment Variables Setup

Render dashboard में "Environment" section में निम्नलिखित variables add करें:

#### Required Variables:

```
SECRET_KEY=your-secret-key-here (generate a new one for production)
DEBUG=False
ALLOWED_HOSTS=your-app-name.onrender.com,localhost,127.0.0.1
```

#### Database Variables (Render PostgreSQL automatically provides these):

```
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_HOST=your-database-host
DB_PORT=5432
```

**Note:** अगर आप Render PostgreSQL database use कर रहे हैं, तो ये variables automatically set हो जाते हैं। बस database को service से link करें।

#### Frontend URL (Vercel पर deployed):

आपका frontend Vercel पर है: `https://project-management-1bt6.vercel.app`

```
FRONTEND_URL=https://project-management-1bt6.vercel.app
```

#### CORS Settings:

Frontend Vercel पर है, इसलिए CORS settings में Vercel URL add करें:

```
CORS_ALLOWED_ORIGINS=https://project-management-1bt6.vercel.app,http://localhost:5173
```

**Note:** `settings.py` में Vercel URL already default में add है, लेकिन अगर आप custom domain use कर रहे हैं तो environment variable में update करें।

### Step 4: PostgreSQL Database Setup

1. Render dashboard में "New +" → "PostgreSQL" select करें
2. Database name और plan choose करें
3. Database create होने के बाद, web service में जाकर "Environment" section में database को link करें
4. Render automatically database connection variables provide करेगा

### Step 5: Static Files & Media Files

- **Static Files:** WhiteNoise automatically handle करेगा (build script में `collectstatic` run होता है)
- **Media Files:** Render में persistent storage के लिए, आपको external storage (जैसे AWS S3) use करना होगा

### Step 6: Deploy

1. सभी settings configure करने के बाद "Create Web Service" पर click करें
2. Render automatically build और deploy शुरू कर देगा
3. Logs check करें कि सब कुछ सही से चल रहा है

## 🔧 Important Configuration

### Python Version

`runtime.txt` file में Python version specify की गई है: `python-3.11.9`

### Dependencies

सभी dependencies `requirements.txt` में listed हैं:
- Django 5.2.6
- Django REST Framework
- PostgreSQL adapter (psycopg2-binary)
- Gunicorn (production server)
- WhiteNoise (static files)
- और अन्य required packages

### Security Settings

Production में automatically enable हो जाते हैं:
- `SESSION_COOKIE_SECURE = True`
- `CSRF_COOKIE_SECURE = True`
- `SECURE_BROWSER_XSS_FILTER = True`
- `X_FRAME_OPTIONS = 'DENY'`

## 📝 Post-Deployment

### Create Superuser

Render dashboard में "Shell" tab में जाकर:

```bash
cd backend/project_management
python manage.py createsuperuser
```

### Check Application

1. Application URL पर जाएं: `https://your-app-name.onrender.com`
2. Admin panel: `https://your-app-name.onrender.com/admin/`
3. API endpoints: `https://your-app-name.onrender.com/api/`

## 🐛 Troubleshooting

### Build Fails

- Check logs में error message
- Ensure सभी dependencies `requirements.txt` में हैं
- Python version check करें (`runtime.txt`)

### Database Connection Issues

- Check database variables correctly set हैं
- Database service running है
- Database को web service से properly linked है

### Static Files Not Loading

- Check `collectstatic` build command में run हो रहा है
- WhiteNoise middleware properly configured है
- `STATIC_ROOT` path correct है

### CORS Errors

- Frontend URL (Vercel: `https://project-management-1bt6.vercel.app`) को `CORS_ALLOWED_ORIGINS` में add करें
- `FRONTEND_URL` environment variable set करें: `FRONTEND_URL=https://project-management-1bt6.vercel.app`
- Check करें कि frontend में API base URL Render backend URL point कर रहा है
- Browser console में CORS error check करें

## 📚 Additional Resources

- [Render Django Documentation](https://render.com/docs/deploy-django)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/)
- [WhiteNoise Documentation](https://whitenoise.readthedocs.io/)

## ✅ Checklist

- [ ] GitHub repository connected
- [ ] Build command configured
- [ ] Start command configured
- [ ] Environment variables set
- [ ] PostgreSQL database created and linked
- [ ] SECRET_KEY generated and set
- [ ] DEBUG=False set
- [ ] ALLOWED_HOSTS configured
- [ ] Frontend URL configured (if applicable)
- [ ] CORS settings configured
- [ ] Superuser created
- [ ] Application tested

---

**Note:** Production में deploy करने से पहले, local environment में test कर लें कि सब कुछ सही से काम कर रहा है।

