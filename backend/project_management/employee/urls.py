from django.urls import path
from . import views

app_name = 'employee'

urlpatterns = [
    # Employee endpoints
    path('employee/', views.create_employee, name='employee-create'),  # POST to create
    path('employees/', views.employee_list, name='employee-list'),  # GET list
    path('employees/<int:pk>/', views.employee_detail, name='employee-detail'),  # GET/PUT/DELETE
    
    # Employee names for dropdowns
    path('employees-name/', views.employee_names_list, name='employee-names'),
    
    # Resume parsing
    path('parse-resume/', views.parse_resume_api, name='parse-resume'),
    
    # Dashboard summary
    path('dashboard-summary/', views.dashboard_summary, name='dashboard-summary'),
    
    # AI endpoints
    path('ai/insights/', views.ai_employee_insights, name='ai-employee-insights'),
    path('ai/similar/<int:employee_id>/', views.ai_similar_employees, name='ai-similar-employees'),
    path('ai/team-recommendations/', views.ai_team_recommendations, name='ai-team-recommendations'),
    path('ai/churn-prediction/', views.ai_churn_prediction, name='ai-churn-prediction'),
    path('ai/natural-language-search/', views.ai_natural_language_search, name='ai-natural-language-search'),
]

