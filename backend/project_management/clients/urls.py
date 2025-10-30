from django.urls import path
from . import views

app_name = 'clients'

urlpatterns = [
    path('clients/', views.client_list, name='client-list'),
    path('clients/<int:pk>/', views.client_detail, name='client-detail'),
    path('clients-name/', views.client_names_list, name='client-names'),
]


