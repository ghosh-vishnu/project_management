from django.urls import path
from . import views

app_name = 'finance'

urlpatterns = [
    path('incomes/', views.income_list, name='income-list'),
    path('incomes/<int:pk>/', views.income_detail, name='income-detail'),
    path('expenses/', views.expense_list, name='expense-list'),
    path('expenses/<int:pk>/', views.expense_detail, name='expense-detail'),
]

