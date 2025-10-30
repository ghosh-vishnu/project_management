from django.urls import path
from . import views

app_name = 'contracts'

urlpatterns = [
    path('contracts/', views.contract_list, name='contract-list'),
    path('contracts/<int:pk>/', views.contract_detail, name='contract-detail'),
]


