from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('reset-password/', views.reset_password_view, name='reset_password'),
    path('change-password/', views.change_password_view, name='change_password'),
    path('profile/', views.profile_view, name='profile'),
    path('user-profile/', views.user_profile_view, name='user_profile'),
    path('recent-work/', views.user_recent_work_view, name='user_recent_work'),
    path('projects/', views.user_projects_view, name='user_projects'),
    path('search/', views.global_search_view, name='global_search'),
]

