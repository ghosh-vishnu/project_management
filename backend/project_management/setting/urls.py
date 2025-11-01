from django.urls import path
from . import views

app_name = 'setting'

urlpatterns = [
    path('bank-accounts/', views.bank_account_list, name='bank-account-list'),
    path('bank-accounts/<int:pk>/', views.bank_account_detail, name='bank-account-detail'),
    path('bank-accounts-name/', views.bank_account_names_list, name='bank-account-names-list'),
]

