from django.urls import path
from . import views

app_name = 'proposal'

urlpatterns = [
    path('proposals/', views.proposal_list, name='proposal-list'),
    path('proposals/<int:pk>/', views.proposal_detail, name='proposal-detail'),
]

