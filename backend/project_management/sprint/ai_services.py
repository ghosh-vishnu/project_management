"""
AI Services for Sprint Module
Provides AI-powered features like task description generation, priority suggestion, etc.
"""

import re
from typing import Dict, List, Optional


class SprintAIService:
    """AI service for sprint-related features"""
    
    # Priority keywords mapping
    PRIORITY_KEYWORDS = {
        'high': [
            'urgent', 'critical', 'blocker', 'bug', 'error', 'fix', 'hotfix',
            'security', 'production', 'down', 'broken', 'crash', 'urgent',
            'asap', 'immediate', 'emergency', 'p0', 'p1', 'severe'
        ],
        'medium': [
            'feature', 'enhancement', 'improve', 'update', 'refactor',
            'optimize', 'modify', 'change', 'add', 'implement'
        ],
        'low': [
            'nice to have', 'optional', 'future', 'backlog', 'documentation',
            'cleanup', 'polish', 'minor', 'cosmetic', 'nice-to-have'
        ]
    }
    
    @staticmethod
    def suggest_priority(title: str, description: str = "") -> str:
        """
        Suggest task priority based on title and description keywords
        
        Args:
            title: Task title
            description: Task description (optional)
            
        Returns:
            Suggested priority: 'high', 'medium', or 'low'
        """
        if not title:
            return 'medium'
        
        text = (title + " " + (description or "")).lower()
        
        # Count keyword matches
        scores = {'high': 0, 'medium': 0, 'low': 0}
        
        for priority, keywords in SprintAIService.PRIORITY_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    scores[priority] += 1
        
        # Return priority with highest score, default to medium
        if scores['high'] > 0:
            return 'high'
        elif scores['low'] > scores['medium'] and scores['low'] > 0:
            return 'low'
        else:
            return 'medium'
    
    @staticmethod
    def generate_task_description(title: str, sprint_context: Optional[Dict] = None) -> str:
        """
        Generate task description from title using template-based approach
        
        Args:
            title: Task title
            sprint_context: Optional sprint context (name, goals, etc.)
            
        Returns:
            Generated task description
        """
        if not title:
            return ""
        
        # Extract key information from title
        title_lower = title.lower()
        
        # Detect task type
        task_type = "task"
        if any(word in title_lower for word in ['bug', 'fix', 'error', 'issue']):
            task_type = "bug fix"
        elif any(word in title_lower for word in ['feature', 'add', 'implement', 'create']):
            task_type = "feature"
        elif any(word in title_lower for word in ['refactor', 'improve', 'optimize']):
            task_type = "improvement"
        elif any(word in title_lower for word in ['test', 'testing']):
            task_type = "testing"
        elif any(word in title_lower for word in ['document', 'doc', 'write']):
            task_type = "documentation"
        
        # Generate description template
        description_parts = [
            f"## {title}",
            "",
            f"This {task_type} is part of the sprint work.",
        ]
        
        # Add context if available
        if sprint_context:
            sprint_name = sprint_context.get('name', '')
            if sprint_name:
                description_parts.append(f"\n**Sprint:** {sprint_name}")
        
        # Add common sections based on task type
        if task_type == "bug fix":
            description_parts.extend([
                "",
                "### Steps to Reproduce",
                "1. ",
                "",
                "### Expected Behavior",
                "",
                "### Actual Behavior",
                "",
            ])
        elif task_type == "feature":
            description_parts.extend([
                "",
                "### Requirements",
                "- ",
                "",
                "### Acceptance Criteria",
                "- ",
            ])
        elif task_type == "improvement":
            description_parts.extend([
                "",
                "### Current State",
                "",
                "### Proposed Changes",
                "",
            ])
        
        description_parts.extend([
            "",
            "### Notes",
            "",
        ])
        
        return "\n".join(description_parts)
    
    @staticmethod
    def generate_sprint_summary(
        sprint: Dict,
        tasks: List[Dict],
        comments: List[Dict] = None
    ) -> str:
        """
        Generate AI summary of sprint
        
        Args:
            sprint: Sprint data
            tasks: List of tasks
            comments: List of comments (optional)
            
        Returns:
            Generated sprint summary
        """
        summary_parts = [
            f"# Sprint Summary: {sprint.get('name', 'Sprint')}",
            "",
        ]
        
        # Sprint overview
        summary_parts.extend([
            "## Overview",
            f"- **Status:** {sprint.get('status', 'N/A')}",
            f"- **Progress:** {sprint.get('progress', 0)}%",
            f"- **Duration:** {sprint.get('start_date', '')} to {sprint.get('end_date', '')}",
            "",
        ])
        
        # Task statistics
        if tasks:
            total_tasks = len(tasks)
            completed_tasks = len([t for t in tasks if t.get('status') == 'done'])
            in_progress = len([t for t in tasks if t.get('status') == 'in_progress'])
            todo_tasks = len([t for t in tasks if t.get('status') == 'todo'])
            
            summary_parts.extend([
                "## Task Statistics",
                f"- **Total Tasks:** {total_tasks}",
                f"- **Completed:** {completed_tasks} ({int(completed_tasks/total_tasks*100) if total_tasks > 0 else 0}%)",
                f"- **In Progress:** {in_progress}",
                f"- **To Do:** {todo_tasks}",
                "",
            ])
            
            # Priority breakdown
            high_priority = len([t for t in tasks if t.get('priority') == 'high'])
            medium_priority = len([t for t in tasks if t.get('priority') == 'medium'])
            low_priority = len([t for t in tasks if t.get('priority') == 'low'])
            
            summary_parts.extend([
                "## Priority Breakdown",
                f"- **High Priority:** {high_priority} tasks",
                f"- **Medium Priority:** {medium_priority} tasks",
                f"- **Low Priority:** {low_priority} tasks",
                "",
            ])
        
        # Comments summary
        if comments:
            summary_parts.extend([
                "## Team Communication",
                f"- **Total Comments:** {len(comments)}",
                "",
            ])
        
        # Key insights
        summary_parts.extend([
            "## Key Insights",
        ])
        
        if tasks:
            overdue_tasks = [t for t in tasks if t.get('due_date') and t.get('status') != 'done']
            if overdue_tasks:
                summary_parts.append(f"- ⚠️ {len(overdue_tasks)} task(s) may need attention")
            
            unassigned_tasks = [t for t in tasks if not t.get('assigned_to')]
            if unassigned_tasks:
                summary_parts.append(f"- 📋 {len(unassigned_tasks)} task(s) are unassigned")
        
        summary_parts.append("")
        summary_parts.append("---")
        summary_parts.append("*This summary was auto-generated.*")
        
        return "\n".join(summary_parts)
    
    @staticmethod
    def generate_retrospective_insights(
        retrospective: Dict,
        tasks: List[Dict],
        sprint: Dict
    ) -> str:
        """
        Generate AI insights from retrospective data
        
        Args:
            retrospective: Retrospective data
            tasks: List of tasks
            sprint: Sprint data
            
        Returns:
            Generated insights
        """
        insights = [
            "# Retrospective Insights",
            "",
        ]
        
        # Analyze notes (current retrospective structure only has notes field)
        notes = retrospective.get('notes', '')
        if notes:
            insights.extend([
                "## Retrospective Notes",
                notes,
                "",
            ])
        
        # Generate recommendations based on tasks
        if tasks:
            completed = len([t for t in tasks if t.get('status') == 'done'])
            total = len(tasks)
            completion_rate = (completed / total * 100) if total > 0 else 0
            
            insights.extend([
                "## Performance Metrics",
                f"- **Completion Rate:** {completion_rate:.1f}%",
                "",
            ])
            
            if completion_rate < 70:
                insights.append("💡 **Recommendation:** Consider breaking down larger tasks or adjusting sprint scope")
            elif completion_rate >= 90:
                insights.append("✅ **Great job!** High completion rate indicates good sprint planning")
        
        # If notes contain structured format, try to extract insights
        if notes:
            notes_lower = notes.lower()
            if any(keyword in notes_lower for keyword in ['went well', 'success', 'good', 'positive']):
                insights.append("✅ Positive aspects identified in retrospective notes")
            if any(keyword in notes_lower for keyword in ['improve', 'issue', 'problem', 'challenge', 'blocker']):
                insights.append("💡 Areas for improvement mentioned in retrospective notes")
        
        insights.append("---")
        insights.append("*These insights were auto-generated based on your retrospective data.*")
        
        return "\n".join(insights)


