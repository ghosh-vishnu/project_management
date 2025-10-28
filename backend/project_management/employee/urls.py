from django.urls import path
from . import views

app_name = 'employee'

urlpatterns = [
    # Employee endpoints
    path('employee/', views.create_employee, name='employee-create'),  # POST to create
    path('employees/', views.employee_list, name='employee-list'),  # GET list
    path('employees/<int:pk>/', views.employee_detail, name='employee-detail'),  # GET/PUT/DELETE
    
    # Department endpoints
    path('departments/', views.department_list, name='department-list'),
    
    # Designation endpoints
    path('designations/', views.designation_list, name='designation-list'),
    
    # Employee names for dropdowns
    path('employees-name/', views.employee_names_list, name='employee-names'),
]

