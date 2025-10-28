@echo off
echo ========================================
echo Django PostgreSQL Database Setup
echo ========================================
echo.

cd project_management

echo.
echo Step 1: Make sure PostgreSQL service is running
echo.

echo.
echo Step 2: Updating database settings...
echo Please edit: project_management\project_management\settings.py
echo Find line 83 and update your PostgreSQL password
echo.

set /p continue="Have you updated the password in settings.py? (Y/N): "

if /i "%continue%"=="Y" (
    echo.
    echo Step 3: Running migrations...
    python manage.py migrate
    
    echo.
    echo Step 4: Creating superuser...
    python manage.py createsuperuser
    
    echo.
    echo ========================================
    echo Setup Complete!
    echo ========================================
    echo.
    echo To run the server:
    echo   python manage.py runserver
    echo.
) else (
    echo.
    echo Please update settings.py first, then run this script again.
)

pause

