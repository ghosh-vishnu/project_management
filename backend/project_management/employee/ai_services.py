"""
AI Services for Employee Management
Provides AI-powered insights, recommendations, and analytics
"""

import os
import re
from typing import Dict, List
from datetime import date, datetime, timedelta
import requests

class EmployeeAIService:
    """AI service for employee-related features"""
    
    # Using the same AI service pattern as sprint module
    API_URL = os.getenv('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions')
    API_KEY = os.getenv('OPENAI_API_KEY', '')
    
    @staticmethod
    def generate_employee_insights(employees: List[Dict]) -> str:
        """Generate AI-powered insights about the employee workforce"""
        try:
            if not employees:
                return "No employee data available for analysis."
            
            # Calculate basic statistics
            total = len(employees)
            active = len([e for e in employees if e.get('is_active', True)])
            inactive = total - active
            
            # Department distribution
            departments = {}
            for emp in employees:
                dept = emp.get('department', 'Unassigned')
                departments[dept] = departments.get(dept, 0) + 1
            
            # Generate insights using AI
            prompt = f"""Analyze the following employee data and provide key insights:

Total Employees: {total}
Active: {active}
Inactive: {inactive}
Departments: {', '.join([f"{k}: {v}" for k, v in departments.items()])}

Provide 5-7 key insights and recommendations about:
1. Workforce distribution and balance
2. Department strength
3. Any patterns or concerns
4. Recommendations for optimization

Format the response in markdown with clear sections."""

            if EmployeeAIService.API_KEY:
                response = requests.post(
                    EmployeeAIService.API_URL,
                    headers={
                        'Authorization': f'Bearer {EmployeeAIService.API_KEY}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'model': 'gpt-3.5-turbo',
                        'messages': [{'role': 'user', 'content': prompt}],
                        'temperature': 0.7,
                        'max_tokens': 500
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    return response.json()['choices'][0]['message']['content']
            
            # Fallback to rule-based insights
            insights = [
                "# Employee Workforce Insights",
                "",
                f"## Overview",
                f"- **Total Employees:** {total}",
                f"- **Active Employees:** {active} ({active/total*100:.1f}%)" if total > 0 else "- **Active Employees:** 0",
                f"- **Inactive Employees:** {inactive} ({inactive/total*100:.1f}%)" if total > 0 else "- **Inactive Employees:** 0",
                "",
                "## Department Distribution",
            ]
            
            for dept, count in sorted(departments.items(), key=lambda x: x[1], reverse=True):
                percentage = (count / total * 100) if total > 0 else 0
                insights.append(f"- **{dept}:** {count} employees ({percentage:.1f}%)")
            
            insights.extend([
                "",
                "## Key Insights",
                f"- Workforce has {total} total employees",
                f"- Active rate: {(active/total*100):.1f}%" if total > 0 else "- No active employees",
                f"- {len(departments)} different departments represented",
                "",
                "## Recommendations",
                "- Regularly review inactive employees and consider reactivation or removal",
                "- Balance department distribution based on workload",
                "- Conduct periodic performance reviews",
                "- Monitor employee engagement metrics"
            ])
            
            return "\n".join(insights)
            
        except Exception as e:
            return f"Error generating insights: {str(e)}"
    
    @staticmethod
    def find_similar_employees(employee_id: int, employees: List[Dict]) -> List[Dict]:
        """Find employees similar to the given employee based on skills, department, and designation"""
        try:
            # Find the target employee
            target_emp = None
            for emp in employees:
                if emp.get('id') == employee_id:
                    target_emp = emp
                    break
            
            if not target_emp:
                return []
            
            target_dept = target_emp.get('department', '')
            target_designation = target_emp.get('designation', '')
            
            # Calculate similarity scores
            similar_employees = []
            for emp in employees:
                if emp.get('id') == employee_id:
                    continue
                
                score = 0
                if emp.get('department') == target_dept:
                    score += 3
                if emp.get('designation') == target_designation:
                    score += 2
                
                if score > 0:
                    similar_employees.append({
                        'employee': emp,
                        'similarity_score': score
                    })
            
            # Sort by similarity score
            similar_employees.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            # Return top 5 similar employees
            return [item['employee'] for item in similar_employees[:5]]
            
        except Exception as e:
            return []
    
    @staticmethod
    def generate_team_recommendations(employees: List[Dict], requirements: Dict) -> List[Dict]:
        """Generate team recommendations based on requirements"""
        try:
            # Filter employees based on requirements
            candidates = []
            for emp in employees:
                if not emp.get('is_active', True):
                    continue
                
                matches = 0
                if requirements.get('department') and emp.get('department') == requirements['department']:
                    matches += 1
                if requirements.get('designation') and emp.get('designation') == requirements['designation']:
                    matches += 1
                
                if matches > 0:
                    candidates.append({
                        'employee': emp,
                        'match_score': matches
                    })
            
            candidates.sort(key=lambda x: x['match_score'], reverse=True)
            return [item['employee'] for item in candidates[:10]]
            
        except Exception as e:
            return []
    
    @staticmethod
    def predict_employee_churn(employees: List[Dict]) -> List[Dict]:
        """Predict which employees might be at risk of leaving"""
        try:
            at_risk = []
            
            for emp in employees:
                if not emp.get('is_active', True):
                    continue
                
                risk_factors = []
                
                # Check joining date (very new or very old employees)
                joining_date = emp.get('joining_date')
                if joining_date:
                    # This is simplified - in production, use proper date parsing
                    risk_factors.append("Recently joined or long tenure")
                
                # Inactive status
                if not emp.get('is_active'):
                    risk_factors.append("Currently inactive")
                
                # Missing department/designation
                if not emp.get('department') or not emp.get('designation'):
                    risk_factors.append("Incomplete profile")
                
                if risk_factors:
                    at_risk.append({
                        'employee': emp,
                        'risk_factors': risk_factors,
                        'risk_level': 'Medium' if len(risk_factors) == 1 else 'High'
                    })
            
            return sorted(at_risk, key=lambda x: len(x['risk_factors']), reverse=True)[:10]
            
        except Exception as e:
            return []
    
    @staticmethod
    def analyze_natural_language_query(query: str) -> Dict:
        """Parse natural language queries into structured filters"""
        try:
            query_lower = query.lower()
            filters = {}
            
            # Department detection
            departments = ['development', 'design', 'hr', 'sales', 'marketing', 'finance', 'qa', 'support', 'it']
            for dept in departments:
                if dept in query_lower:
                    filters['department'] = dept.title()
                    break
            
            # Status detection
            if 'active' in query_lower or 'working' in query_lower:
                filters['status'] = 'active'
            elif 'inactive' in query_lower:
                filters['status'] = 'inactive'
            
            # Time-based queries
            if 'recent' in query_lower or 'new' in query_lower or 'last month' in query_lower:
                filters['time_range'] = 'recent'
            if 'joined' in query_lower and 'year' in query_lower:
                filters['time_range'] = 'year'
            
            # Number extraction
            if 'top' in query_lower or 'first' in query_lower:
                numbers = re.findall(r'\d+', query)
                if numbers:
                    filters['limit'] = int(numbers[0])
            
            return filters
            
        except Exception as e:
            return {}


class DashboardAIService:
    """AI service for dashboard analytics and predictions"""
    
    API_URL = os.getenv('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions')
    API_KEY = os.getenv('OPENAI_API_KEY', '')
    
    @staticmethod
    def generate_dashboard_insights(projects_data: Dict, financial_data: Dict, workload_data: Dict) -> List[Dict]:
        """Generate comprehensive AI-powered dashboard insights"""
        try:
            insights = []
            
            # Risk Alerts
            if financial_data.get('total_cost', 0) > financial_data.get('total_revenue', 0) * 0.9:
                insights.append({
                    'type': 'warning',
                    'category': 'Financial',
                    'title': 'High Cost Ratio',
                    'message': f"Costs are {((financial_data.get('total_cost', 0) / financial_data.get('total_revenue', 1)) * 100):.1f}% of revenue. Consider cost optimization.",
                    'priority': 'high'
                })
            
            # Project Health Alerts
            overdue_projects = projects_data.get('over_due', 0)
            if overdue_projects > 0:
                insights.append({
                    'type': 'error',
                    'category': 'Projects',
                    'title': 'Overdue Projects',
                    'message': f"{overdue_projects} project(s) are overdue. Immediate attention required.",
                    'priority': 'high'
                })
            
            # Workload Alerts
            if workload_data.get('overutilised', 0) > 20:
                insights.append({
                    'type': 'warning',
                    'category': 'Workload',
                    'title': 'High Overutilization',
                    'message': f"{workload_data.get('overutilised', 0)}% employees are overutilized. Consider resource reallocation.",
                    'priority': 'medium'
                })
            
            # Revenue Forecast
            if financial_data.get('total_revenue', 0) > 0:
                growth_rate = ((financial_data.get('total_revenue', 0) - financial_data.get('planned_revenue', 0)) / financial_data.get('planned_revenue', 1)) * 100
                if growth_rate < -10:
                    insights.append({
                        'type': 'warning',
                        'category': 'Revenue',
                        'title': 'Revenue Below Target',
                        'message': f"Revenue is {abs(growth_rate):.1f}% below planned. Review sales pipeline.",
                        'priority': 'high'
                    })
            
            return insights[:5]  # Return top 5 insights
            
        except Exception as e:
            return [{
                'type': 'info',
                'category': 'System',
                'title': 'Insights Unavailable',
                'message': 'Unable to generate insights at this time.',
                'priority': 'low'
            }]
    
    @staticmethod
    def predict_revenue_forecast(monthly_revenue: float, months: int = 3) -> Dict:
        """Predict revenue for next N months based on monthly revenue"""
        try:
            # monthly_revenue is already a monthly average, use it directly
            base_monthly = monthly_revenue if monthly_revenue > 0 else 0
            forecast = []
            
            for i in range(1, months + 1):
                # Add 5% monthly growth assumption (can be made dynamic)
                # Growth is cumulative: month 1 = 5%, month 2 = 10%, etc.
                predicted = base_monthly * (1 + (0.05 * i))
                forecast.append({
                    'month': i,
                    'predicted_revenue': round(predicted, 2),
                    'confidence': max(70, 100 - (i * 5))  # Decreasing confidence over time
                })
            
            return {
                'forecast': forecast,
                'total_forecast': sum([f['predicted_revenue'] for f in forecast]),
                'growth_rate': 5.0,
                'confidence_avg': sum([f['confidence'] for f in forecast]) / len(forecast) if forecast else 0
            }
        except Exception as e:
            return {'forecast': [], 'total_forecast': 0, 'growth_rate': 0, 'confidence_avg': 0}
    
    @staticmethod
    def calculate_project_health_score(project: Dict) -> Dict:
        """Calculate AI-based health score (0-100) for a project"""
        try:
            score = 100
            factors = []
            
            # Timeline factor (40 points)
            if project.get('end_date'):
                from datetime import date
                today = date.today()
                end_date = project.get('end_date')
                if isinstance(end_date, str):
                    from datetime import datetime
                    end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                
                days_remaining = (end_date - today).days
                progress = project.get('progress', 0)
                
                if days_remaining < 0:
                    score -= 30
                    factors.append('Overdue')
                elif days_remaining < 7 and progress < 80:
                    score -= 20
                    factors.append('At Risk')
                elif progress < 50 and days_remaining < 14:
                    score -= 15
                    factors.append('Behind Schedule')
            
            # Budget factor (30 points)
            if project.get('budget') and project.get('spent'):
                budget_ratio = project.get('spent', 0) / project.get('budget', 1)
                if budget_ratio > 1.1:
                    score -= 25
                    factors.append('Budget Overrun')
                elif budget_ratio > 0.9:
                    score -= 10
                    factors.append('Approaching Budget Limit')
            
            # Task completion factor (20 points)
            if project.get('total_tasks', 0) > 0:
                completion_rate = project.get('completed_tasks', 0) / project.get('total_tasks', 1)
                if completion_rate < 0.5:
                    score -= 15
                    factors.append('Low Task Completion')
            
            # Team workload factor (10 points)
            if project.get('team_workload', 0) > 0.8:
                score -= 10
                factors.append('High Team Workload')
            
            score = max(0, min(100, score))
            
            # Determine health status
            if score >= 80:
                status = 'Healthy'
                color = 'green'
            elif score >= 60:
                status = 'Moderate'
                color = 'yellow'
            else:
                status = 'At Risk'
                color = 'red'
            
            return {
                'score': round(score),
                'status': status,
                'color': color,
                'factors': factors,
                'recommendations': DashboardAIService._get_health_recommendations(score, factors)
            }
        except Exception as e:
            return {'score': 50, 'status': 'Unknown', 'color': 'gray', 'factors': [], 'recommendations': []}
    
    @staticmethod
    def _get_health_recommendations(score: int, factors: List[str]) -> List[str]:
        """Get recommendations based on health score"""
        recommendations = []
        
        if 'Overdue' in factors:
            recommendations.append('Immediate action required: Review timeline and allocate additional resources')
        if 'Budget Overrun' in factors:
            recommendations.append('Review expenses and optimize costs')
        if 'Behind Schedule' in factors:
            recommendations.append('Consider extending deadline or increasing team size')
        if 'Low Task Completion' in factors:
            recommendations.append('Focus on task prioritization and team productivity')
        if 'High Team Workload' in factors:
            recommendations.append('Redistribute workload or add team members')
        
        if score < 60 and not recommendations:
            recommendations.append('Project needs attention. Review all aspects and create action plan')
        
        return recommendations
    
    @staticmethod
    def detect_anomalies(projects: List[Dict], financial_data: Dict) -> List[Dict]:
        """Detect anomalies in projects and financial data"""
        try:
            anomalies = []
            
            # Budget anomalies
            for project in projects:
                if project.get('budget') and project.get('spent'):
                    if project.get('spent', 0) > project.get('budget', 0) * 1.2:
                        anomalies.append({
                            'type': 'budget_spike',
                            'severity': 'high',
                            'project': project.get('title', 'Unknown'),
                            'message': f"Budget exceeded by {((project.get('spent', 0) / project.get('budget', 1) - 1) * 100):.1f}%",
                            'value': project.get('spent', 0)
                        })
            
            # Timeline anomalies
            from datetime import date, timedelta
            today = date.today()
            for project in projects:
                if project.get('end_date'):
                    end_date = project.get('end_date')
                    if isinstance(end_date, str):
                        from datetime import datetime
                        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                    
                    if end_date < today:
                        days_overdue = (today - end_date).days
                        anomalies.append({
                            'type': 'timeline_delay',
                            'severity': 'high' if days_overdue > 7 else 'medium',
                            'project': project.get('title', 'Unknown'),
                            'message': f"Project is {days_overdue} days overdue",
                            'value': days_overdue
                        })
            
            # Revenue anomalies
            if financial_data.get('total_revenue', 0) > 0:
                monthly_avg = financial_data.get('total_revenue', 0) / 12
                # Check if current month revenue is significantly different
                # This is simplified - in production, compare with historical data
                if financial_data.get('current_month_revenue', 0) < monthly_avg * 0.5:
                    anomalies.append({
                        'type': 'revenue_drop',
                        'severity': 'medium',
                        'project': 'Overall',
                        'message': 'Current month revenue is significantly below average',
                        'value': financial_data.get('current_month_revenue', 0)
                    })
            
            return sorted(anomalies, key=lambda x: {'high': 3, 'medium': 2, 'low': 1}.get(x.get('severity', 'low'), 0), reverse=True)[:10]
            
        except Exception as e:
            return []
    
    @staticmethod
    def generate_smart_recommendations(projects: List[Dict], employees: List[Dict], financial_data: Dict) -> List[Dict]:
        """Generate smart recommendations for resource allocation and optimization"""
        try:
            recommendations = []
            
            # Resource allocation recommendations
            overutilized_employees = [e for e in employees if e.get('task_count', 0) > 15]
            underutilized_employees = [e for e in employees if e.get('task_count', 0) < 5]
            
            if overutilized_employees and underutilized_employees:
                recommendations.append({
                    'type': 'resource_allocation',
                    'priority': 'high',
                    'title': 'Rebalance Workload',
                    'message': f"Consider redistributing tasks from {len(overutilized_employees)} overutilized to {len(underutilized_employees)} underutilized employees",
                    'action': 'rebalance_workload'
                })
            
            # Project prioritization
            at_risk_projects = [p for p in projects if p.get('health_score', 100) < 60]
            if at_risk_projects:
                recommendations.append({
                    'type': 'project_priority',
                    'priority': 'high',
                    'title': 'Focus on At-Risk Projects',
                    'message': f"{len(at_risk_projects)} project(s) need immediate attention",
                    'action': 'review_projects',
                    'projects': [p.get('title') for p in at_risk_projects[:3]]
                })
            
            # Budget optimization
            if financial_data.get('total_cost', 0) > financial_data.get('total_revenue', 0) * 0.85:
                recommendations.append({
                    'type': 'budget_optimization',
                    'priority': 'medium',
                    'title': 'Optimize Costs',
                    'message': 'Costs are high relative to revenue. Review and optimize expenses',
                    'action': 'review_expenses'
                })
            
            return recommendations[:5]
            
        except Exception as e:
            return []
    
    @staticmethod
    def calculate_risk_scores(projects: List[Dict], employees: List[Dict]) -> Dict:
        """Calculate risk scores for projects and employees"""
        try:
            project_risks = []
            for project in projects:
                health = DashboardAIService.calculate_project_health_score(project)
                risk_score = 100 - health.get('score', 50)
                project_risks.append({
                    'project_id': project.get('id'),
                    'project_name': project.get('title', 'Unknown'),
                    'risk_score': risk_score,
                    'risk_level': 'high' if health.get('score', 50) < 60 else 'medium' if health.get('score', 50) < 80 else 'low',
                    'factors': health.get('factors', []),
                    'assigned_team_members': project.get('assigned_team_members', []),  # List of employees assigned to this project
                })
            
            # Employee churn risk (simplified)
            employee_risks = []
            for emp in employees:
                if not emp.get('is_active', True):
                    continue
                
                risk_factors = []
                risk_score = 0
                
                # High workload (lowered threshold to catch more cases)
                task_count = emp.get('task_count', 0)
                if task_count > 12:  # Lowered from 15 to 12
                    risk_score += 30
                    risk_factors.append(f'High workload ({task_count} tasks)')
                elif task_count > 10:  # Medium workload
                    risk_score += 15
                    risk_factors.append(f'Moderate workload ({task_count} tasks)')
                
                # Missing department/designation
                if not emp.get('department') or not emp.get('designation'):
                    risk_score += 20
                    risk_factors.append('Incomplete profile')
                
                # Long tenure without promotion (simplified check)
                tenure_days = emp.get('tenure_days', 0)
                if tenure_days > 1095:  # 3 years
                    risk_score += 15
                    risk_factors.append(f'Long tenure ({tenure_days // 365} years)')
                elif tenure_days > 730:  # 2 years
                    risk_score += 10
                    risk_factors.append(f'Moderate tenure ({tenure_days // 365} years)')
                
                # Underutilized employees (low task count can also be a risk)
                if task_count < 3 and task_count > 0:  # Very few tasks
                    risk_score += 10
                    risk_factors.append(f'Underutilized ({task_count} tasks)')
                
                # Always include employee, even with 0 risk, but prioritize those with risks
                employee_risks.append({
                    'employee_id': emp.get('id'),
                    'employee_name': emp.get('name', 'Unknown'),
                    'risk_score': min(100, risk_score),
                    'risk_level': 'high' if risk_score > 50 else 'medium' if risk_score > 25 else 'low',
                    'factors': risk_factors if risk_factors else ['No risks detected'],
                    'task_count': task_count,
                    'tenure_days': tenure_days
                })
            
            # Return all projects (not just top 10) so team members are always visible
            # Sort by risk score descending, but include all projects
            sorted_project_risks = sorted(project_risks, key=lambda x: x['risk_score'], reverse=True)
            
            return {
                'project_risks': sorted_project_risks,  # Return all projects, not just top 10
                'employee_risks': sorted(employee_risks, key=lambda x: x['risk_score'], reverse=True)[:10],
                'overall_risk': 'high' if any(p['risk_score'] > 70 for p in project_risks) else 'medium' if any(p['risk_score'] > 40 for p in project_risks) else 'low'
            }
            
        except Exception as e:
            return {'project_risks': [], 'employee_risks': [], 'overall_risk': 'low'}
    
    @staticmethod
    def generate_trend_predictions(financial_data: List[Dict], project_data: List[Dict], months: int = 6) -> Dict:
        """Generate trend predictions for revenue, projects, and costs"""
        try:
            # Revenue trend - use average of last 3 months or recent revenue
            if financial_data:
                # Calculate average of last 3 months for more stable prediction
                recent_months = financial_data[:3] if len(financial_data) >= 3 else financial_data
                avg_revenue = sum([d.get('revenue', 0) for d in recent_months if isinstance(d, dict)]) / len(recent_months) if recent_months else 0
                
                # If average is 0, use the most recent non-zero value
                if avg_revenue == 0:
                    for d in financial_data:
                        if isinstance(d, dict) and d.get('revenue', 0) > 0:
                            avg_revenue = d.get('revenue', 0)
                            break
                
                # If still 0, use last month's revenue
                if avg_revenue == 0:
                    recent_revenue = financial_data[-1].get('revenue', 0) if isinstance(financial_data[-1], dict) else 0
                    avg_revenue = recent_revenue
                
                revenue_trend = DashboardAIService.predict_revenue_forecast(avg_revenue, months)
            else:
                revenue_trend = {'forecast': [], 'total_forecast': 0, 'growth_rate': 0}
            
            # Project completion trend
            project_completions = []
            if project_data:
                current_completed = sum(1 for p in project_data if p.get('status') == 'completed')
                completion_rate = current_completed / len(project_data) if project_data else 0
                
                for i in range(1, months + 1):
                    # Simple projection based on current rate
                    predicted_completions = current_completed + (completion_rate * i * 0.1)
                    project_completions.append({
                        'month': i,
                        'predicted_completions': round(predicted_completions, 1),
                        'confidence': max(60, 100 - (i * 5))
                    })
            
            # Cost trend - use average of last 3 months
            cost_trend = []
            if financial_data:
                # Calculate average of last 3 months for more stable prediction
                recent_months = financial_data[:3] if len(financial_data) >= 3 else financial_data
                avg_monthly_cost = sum([d.get('cost', 0) for d in recent_months if isinstance(d, dict)]) / len(recent_months) if recent_months else 0
                
                # If average is 0, use the most recent non-zero value
                if avg_monthly_cost == 0:
                    for d in financial_data:
                        if isinstance(d, dict) and d.get('cost', 0) > 0:
                            avg_monthly_cost = d.get('cost', 0)
                            break
                
                # If still 0, use last month's cost
                if avg_monthly_cost == 0:
                    recent_cost = financial_data[-1].get('cost', 0) if isinstance(financial_data[-1], dict) else 0
                    avg_monthly_cost = recent_cost
                
                # Base cost for prediction
                base_cost = avg_monthly_cost if avg_monthly_cost > 0 else 0
                
                for i in range(1, months + 1):
                    # Assume 2% monthly cost increase (more realistic)
                    predicted_cost = base_cost * (1 + (0.02 * i))
                    cost_trend.append({
                        'month': i,
                        'predicted_cost': round(predicted_cost, 2),
                        'confidence': max(65, 100 - (i * 4))
                    })
            
            return {
                'revenue_trend': revenue_trend,
                'project_completions': project_completions,
                'cost_trend': cost_trend,
                'generated_at': str(date.today())
            }
            
        except Exception as e:
            return {
                'revenue_trend': {'forecast': []},
                'project_completions': [],
                'cost_trend': [],
                'generated_at': str(date.today())
            }
    
    @staticmethod
    def benchmark_performance(current_data: Dict, historical_data: List[Dict]) -> Dict:
        """Compare current performance with historical data"""
        try:
            benchmarks = {}
            
            # Revenue benchmark - compare current month with historical average
            if historical_data:
                # Calculate average of historical months (excluding current month)
                historical_revenues = [d.get('revenue', 0) for d in historical_data if isinstance(d, dict)]
                historical_avg = sum(historical_revenues) / len(historical_revenues) if historical_revenues else 0
                current_revenue = current_data.get('revenue', 0)
                
                # Calculate percentage change
                if historical_avg > 0:
                    revenue_change = ((current_revenue - historical_avg) / historical_avg * 100)
                elif current_revenue > 0:
                    revenue_change = 100  # New revenue, 100% increase
                else:
                    revenue_change = 0
                
                benchmarks['revenue'] = {
                    'current': round(current_revenue, 2),
                    'historical_avg': round(historical_avg, 2),
                    'change_percent': round(revenue_change, 2),
                    'trend': 'up' if revenue_change > 0 else 'down' if revenue_change < 0 else 'stable'
                }
            
            # Project completion benchmark - compare current month with historical average
            if historical_data:
                # Calculate average of historical months (excluding current month)
                historical_completions = [d.get('completed_projects', 0) for d in historical_data if isinstance(d, dict)]
                historical_avg_completed = sum(historical_completions) / len(historical_completions) if historical_completions else 0
                current_completed = current_data.get('completed_projects', 0)
                
                # Calculate percentage change
                if historical_avg_completed > 0:
                    completion_change = ((current_completed - historical_avg_completed) / historical_avg_completed * 100)
                elif current_completed > 0:
                    completion_change = 100  # New completions, 100% increase
                else:
                    completion_change = 0
                
                benchmarks['project_completion'] = {
                    'current': current_completed,
                    'historical_avg': round(historical_avg_completed, 2),
                    'change_percent': round(completion_change, 2),
                    'trend': 'up' if completion_change > 0 else 'down' if completion_change < 0 else 'stable'
                }
            
            return benchmarks
            
        except Exception as e:
            return {}
    
    @staticmethod
    def process_natural_language_query(query: str, available_data: Dict) -> Dict:
        """Process natural language queries for dashboard"""
        try:
            query_lower = query.lower()
            response = {
                'query': query,
                'intent': 'unknown',
                'data': {},
                'message': ''
            }
            
            # Revenue queries
            if 'revenue' in query_lower or 'income' in query_lower:
                response['intent'] = 'revenue'
                if 'forecast' in query_lower or 'predict' in query_lower or 'next' in query_lower:
                    response['data'] = DashboardAIService.predict_revenue_forecast(
                        available_data.get('current_revenue', 0), 3
                    )
                    response['message'] = f"Revenue forecast for next 3 months: ₹{response['data'].get('total_forecast', 0):,.0f}"
                elif 'current' in query_lower or 'now' in query_lower:
                    response['data'] = {'current_revenue': available_data.get('current_revenue', 0)}
                    response['message'] = f"Current revenue: ₹{available_data.get('current_revenue', 0):,.0f}"
            
            # Project queries
            elif 'project' in query_lower:
                response['intent'] = 'projects'
                if 'risk' in query_lower or 'at risk' in query_lower:
                    projects = available_data.get('projects', [])
                    at_risk = [p for p in projects if p.get('health_score', 100) < 60]
                    response['data'] = {'at_risk_projects': len(at_risk)}
                    response['message'] = f"{len(at_risk)} project(s) are at risk"
                elif 'status' in query_lower:
                    projects = available_data.get('projects', [])
                    status_count = {}
                    for p in projects:
                        status = p.get('status', 'unknown')
                        status_count[status] = status_count.get(status, 0) + 1
                    response['data'] = status_count
                    response['message'] = f"Project status: {', '.join([f'{k}: {v}' for k, v in status_count.items()])}"
            
            # Workload queries
            elif 'workload' in query_lower or 'employee' in query_lower:
                response['intent'] = 'workload'
                workload = available_data.get('workload', {})
                response['data'] = workload
                response['message'] = f"Workload distribution: Healthy {workload.get('healthy', 0)}%, Overutilized {workload.get('overutilised', 0)}%"
            
            return response
            
        except Exception as e:
            return {'query': query, 'intent': 'error', 'data': {}, 'message': 'Unable to process query'}

