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
    path('dashboard/project-progress/', views.dashboard_project_progress, name='dashboard-project-progress'),
    path('dashboard/weekly-progress/', views.dashboard_weekly_progress, name='dashboard-weekly-progress'),
    path('dashboard/status-percentage/', views.dashboard_status_percentage, name='dashboard-status-percentage'),
    path('dashboard/ai-insights/', views.dashboard_ai_insights, name='dashboard-ai-insights'),
    path('dashboard/kanban-data/', views.dashboard_kanban_data, name='dashboard-kanban-data'),
    
    # AI endpoints
    path('ai/insights/', views.ai_employee_insights, name='ai-employee-insights'),
    path('ai/similar/<int:employee_id>/', views.ai_similar_employees, name='ai-similar-employees'),
    path('ai/team-recommendations/', views.ai_team_recommendations, name='ai-team-recommendations'),
    path('ai/churn-prediction/', views.ai_churn_prediction, name='ai-churn-prediction'),
    path('ai/natural-language-search/', views.ai_natural_language_search, name='ai-natural-language-search'),
    
    # Dashboard AI endpoints
    path('dashboard/ai/insights-comprehensive/', views.dashboard_ai_insights_comprehensive, name='dashboard-ai-insights-comprehensive'),
    path('dashboard/ai/revenue-forecast/', views.dashboard_revenue_forecast, name='dashboard-revenue-forecast'),
    path('dashboard/ai/project-health-scores/', views.dashboard_project_health_scores, name='dashboard-project-health-scores'),
    path('dashboard/ai/anomaly-detection/', views.dashboard_anomaly_detection, name='dashboard-anomaly-detection'),
    path('dashboard/ai/smart-recommendations/', views.dashboard_smart_recommendations, name='dashboard-smart-recommendations'),
    path('dashboard/ai/risk-assessment/', views.dashboard_risk_assessment, name='dashboard-risk-assessment'),
    path('dashboard/ai/trend-predictions/', views.dashboard_trend_predictions, name='dashboard-trend-predictions'),
    path('dashboard/ai/performance-benchmark/', views.dashboard_performance_benchmark, name='dashboard-performance-benchmark'),
    path('dashboard/ai/natural-language-query/', views.dashboard_natural_language_query, name='dashboard-natural-language-query'),
]

