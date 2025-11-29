from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.notification_list, name='notification-list'),
    path('notifications/unread-count/', views.notification_unread_count, name='notification-unread-count'),
    path('notifications/<int:notification_id>/read/', views.notification_mark_read, name='notification-mark-read'),
    path('notifications/mark-all-read/', views.notification_mark_all_read, name='notification-mark-all-read'),
    path('notifications/<int:notification_id>/delete/', views.notification_delete, name='notification-delete'),
    path('notifications/create/', views.notification_create, name='notification-create'),
]



