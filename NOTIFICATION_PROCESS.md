# 🔔 Notification System - Complete Process Explanation

## 📋 Overview
Yeh system automatically notifications create karta hai jab kuch important events hote hain.

## 🔄 Complete Flow

### 1. **Event Trigger** (Kuch Action Hota Hai)
Jab aap koi action karte ho, jaise:
- ✅ **Employee Create** → New employee add karte ho
- ✅ **Task Assign** → Task kisi ko assign karte ho  
- ✅ **Sprint Create** → New sprint banate ho

### 2. **Backend Processing** (Django)
- Code automatically detect karta hai ki event hua
- Notification create hota hai database mein
- User ko notification assign hota hai

### 3. **Database Storage** (PostgreSQL)
Notification table mein save hota hai:
```
- user_id (kis user ko notification)
- type (notification type - task_assigned, employee_added, etc.)
- title (notification title)
- message (notification message)
- read (read hai ya nahi - default: false)
- created_at (kab create hua)
```

### 4. **Frontend Polling** (React)
- Frontend har 30 seconds mein check karta hai
- Unread count fetch karta hai
- Notification bell pe badge dikhata hai

### 5. **User Interaction**
- User notification bell pe click karta hai
- Dropdown open hota hai with all notifications
- User notification pe click karke read kar sakta hai
- User mark as read kar sakta hai

## 📊 Example Flow

### Example 1: Employee Create
```
1. Admin employee create karta hai
   ↓
2. Backend: employee/views.py → create_employee()
   ↓
3. Notification trigger: notify_employee_added()
   ↓
4. Database: Notification table mein entry
   ↓
5. Frontend: 30 sec baad poll karke fetch karta hai
   ↓
6. UI: Notification bell pe badge dikhata hai
```

### Example 2: Task Assignment
```
1. User task assign karta hai kisi employee ko
   ↓
2. Backend: tasks/views.py → task_list() POST
   ↓
3. Notification trigger: notify_task_assigned()
   ↓
4. Database: Notification saved
   ↓
5. Assigned employee ko notification milta hai
```

## 🗄️ Database Structure

### Notification Table
```sql
CREATE TABLE notifications_notification (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER (Foreign Key to auth_user),
    type VARCHAR(50),
    title VARCHAR(200),
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    related_object_type VARCHAR(50),
    related_object_id INTEGER,
    action_url VARCHAR(500)
);
```

## 🔧 API Endpoints

### 1. Get All Notifications
```
GET /api/notifications/
Response: {
    "count": 10,
    "results": [...],
    "page": 1,
    "page_size": 20
}
```

### 2. Get Unread Count
```
GET /api/notifications/unread-count/
Response: {
    "unread_count": 5
}
```

### 3. Mark as Read
```
POST /api/notifications/{id}/read/
Response: Notification object
```

### 4. Mark All as Read
```
POST /api/notifications/mark-all-read/
Response: {
    "message": "5 notifications marked as read",
    "updated_count": 5
}
```

## 🧹 Database Clean Commands

### Option 1: Clean Only Notifications
```bash
cd backend/project_management
python manage.py clean_notifications
```

### Option 2: Clean All Notifications (with confirmation)
```bash
python manage.py clean_notifications --confirm
```

### Option 3: Reset Complete Database (⚠️ All Data Will Be Lost)
```bash
# Delete all migrations
python manage.py migrate --fake-initial

# Or reset specific app
python manage.py migrate notifications zero
python manage.py migrate notifications
```

## 📝 Notification Types

| Type | When Triggered | Example |
|------|---------------|---------|
| `task_assigned` | Task assign hota hai | "You have been assigned a new task: Fix Bug" |
| `task_completed` | Task complete hota hai | "Task 'Fix Bug' has been marked as completed" |
| `employee_added` | New employee add hota hai | "A new employee 'John Doe' has been added" |
| `sprint_created` | Sprint create hota hai | "A new sprint 'Sprint 1' has been created" |
| `deadline_approaching` | Deadline near hai | "Task 'Fix Bug' deadline is in 2 days" |

## 🎯 Testing Notifications

### Test 1: Create Employee
1. Employee create karo
2. Admin users ko notification milega
3. Check notification bell

### Test 2: Assign Task
1. Task create karo aur assign karo
2. Assigned user ko notification milega
3. Check notification dropdown

### Test 3: Create Sprint
1. Sprint create karo
2. Creator ko notification milega
3. Check notifications

## 🔍 Debugging

### Check Notifications in Database
```python
# Django shell
python manage.py shell

from notifications.models import Notification
from django.contrib.auth.models import User

# Get all notifications
notifications = Notification.objects.all()
print(f"Total: {notifications.count()}")

# Get unread notifications
unread = Notification.objects.filter(read=False)
print(f"Unread: {unread.count()}")

# Get notifications for specific user
user = User.objects.get(username='admin')
user_notifications = Notification.objects.filter(user=user)
print(f"User notifications: {user_notifications.count()}")
```

## ✅ Summary

1. **Event** → Action hota hai (employee create, task assign, etc.)
2. **Trigger** → Backend code notification create karta hai
3. **Storage** → Database mein save hota hai
4. **Polling** → Frontend har 30 sec check karta hai
5. **Display** → Notification bell pe badge dikhata hai
6. **Interaction** → User click karke dekh sakta hai

Yeh complete process hai! 🎉


