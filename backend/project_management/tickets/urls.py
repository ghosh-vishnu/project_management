from django.urls import path
from . import views

app_name = 'tickets'

urlpatterns = [
    path('tickets/', views.ticket_list, name='ticket-list'),
    path('tickets/<int:pk>/', views.ticket_detail, name='ticket-detail'),
]

