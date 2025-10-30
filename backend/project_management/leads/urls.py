from django.urls import path
from . import views

app_name = 'leads'

urlpatterns = [
    path('leads/', views.lead_list, name='lead-list'),
    path('leads/<int:pk>/', views.lead_detail, name='lead-detail'),
    path('leads-name/', views.lead_names_list, name='lead-names'),
]

