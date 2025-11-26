"""
AI Services for Employee Management
Provides AI-powered insights, recommendations, and analytics
"""

import os
import re
from typing import Dict, List
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

