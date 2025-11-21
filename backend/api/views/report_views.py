from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from datetime import datetime, timedelta
from ..models.project import Project
from ..models.task import Task
from ..models.user import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_reports(request):
    """
    Generate comprehensive reports for admin users.
    Query params: start_date, end_date, project_id
    """
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=403)
    
    # Get query parameters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    project_id = request.GET.get('project_id')
    
    # Build base queries
    projects_query = Project.objects.all()
    tasks_query = Task.objects.all()
    
    # Apply filters
    if project_id:
        projects_query = projects_query.filter(id=project_id)
        tasks_query = tasks_query.filter(project_id=project_id)
    
    if start_date:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        tasks_query = tasks_query.filter(created_at__gte=start)
        projects_query = projects_query.filter(created_at__gte=start)
    
    if end_date:
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        tasks_query = tasks_query.filter(created_at__lte=end)
        projects_query = projects_query.filter(created_at__lte=end)
    
    # Project Progress Summaries
    project_summaries = []
    for project in projects_query:
        total_tasks = project.tasks.count()
        completed_tasks = project.tasks.filter(status='completed').count()
        in_progress_tasks = project.tasks.filter(status='in_progress').count()
        todo_tasks = project.tasks.filter(status='todo').count()
        
        completion_percentage = round((completed_tasks / total_tasks * 100), 2) if total_tasks > 0 else 0
        
        project_summaries.append({
            'project_id': project.id,
            'project_name': project.title,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'todo_tasks': todo_tasks,
            'completion_percentage': completion_percentage,
            'created_by': f"{project.created_by.first_name} {project.created_by.last_name}",
            'member_count': project.members.count() + 1,  # +1 for creator
        })
    
    # Task Completion Rates
    total_tasks = tasks_query.count()
    completed_tasks = tasks_query.filter(status='completed').count()
    in_progress_tasks = tasks_query.filter(status='in_progress').count()
    todo_tasks = tasks_query.filter(status='todo').count()
    
    overall_completion_rate = round((completed_tasks / total_tasks * 100), 2) if total_tasks > 0 else 0
    
    # Priority breakdown
    high_priority = tasks_query.filter(priority='high').count()
    medium_priority = tasks_query.filter(priority='medium').count()
    low_priority = tasks_query.filter(priority='low').count()
    
    high_completed = tasks_query.filter(priority='high', status='completed').count()
    medium_completed = tasks_query.filter(priority='medium', status='completed').count()
    low_completed = tasks_query.filter(priority='low', status='completed').count()
    
    task_completion_rates = {
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'in_progress_tasks': in_progress_tasks,
        'todo_tasks': todo_tasks,
        'overall_completion_rate': overall_completion_rate,
        'by_priority': {
            'high': {
                'total': high_priority,
                'completed': high_completed,
                'rate': round((high_completed / high_priority * 100), 2) if high_priority > 0 else 0
            },
            'medium': {
                'total': medium_priority,
                'completed': medium_completed,
                'rate': round((medium_completed / medium_priority * 100), 2) if medium_priority > 0 else 0
            },
            'low': {
                'total': low_priority,
                'completed': low_completed,
                'rate': round((low_completed / low_priority * 100), 2) if low_priority > 0 else 0
            }
        }
    }
    
    # Team Member Productivity (exclude viewing admin)
    users = User.objects.filter(is_active=True).exclude(id=request.user.id)
    member_productivity = []
    
    for user in users:
        user_tasks = tasks_query.filter(assigned_to=user)
        total_assigned = user_tasks.count()
        completed = user_tasks.filter(status='completed').count()
        in_progress = user_tasks.filter(status='in_progress').count()
        
        # Projects involved in
        created_projects = projects_query.filter(created_by=user).count()
        member_projects = projects_query.filter(members=user).count()
        
        completion_rate = round((completed / total_assigned * 100), 2) if total_assigned > 0 else 0
        
        member_productivity.append({
            'user_id': user.id,
            'name': f"{user.first_name} {user.last_name}",
            'email': user.email,
            'total_tasks_assigned': total_assigned,
            'completed_tasks': completed,
            'in_progress_tasks': in_progress,
            'completion_rate': completion_rate,
            'projects_created': created_projects,
            'projects_member': member_projects,
        })
    
    # Sort by completion rate
    member_productivity.sort(key=lambda x: x['completion_rate'], reverse=True)
    
    return Response({
        'project_summaries': project_summaries,
        'task_completion_rates': task_completion_rates,
        'member_productivity': member_productivity,
        'filters': {
            'start_date': start_date,
            'end_date': end_date,
            'project_id': project_id
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_reports(request):
    """
    Generate scoped reports for regular users.
    Only shows data for projects they created or are members of.
    Query params: start_date, end_date, project_id
    """
    user = request.user
    
    # Get query parameters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    project_id = request.GET.get('project_id')
    
    # Base queries - only projects user has access to
    projects_query = Project.objects.filter(
        Q(created_by=user) | Q(members=user)
    ).distinct()
    
    tasks_query = Task.objects.filter(
        Q(project__created_by=user) | Q(project__members=user) | Q(assigned_to=user)
    ).distinct()
    
    # Apply filters
    if project_id:
        # Verify user has access to this project
        if not projects_query.filter(id=project_id).exists():
            return Response({'error': 'Access denied to this project'}, status=403)
        projects_query = projects_query.filter(id=project_id)
        tasks_query = tasks_query.filter(project_id=project_id)
    
    if start_date:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        tasks_query = tasks_query.filter(created_at__gte=start)
        projects_query = projects_query.filter(created_at__gte=start)
    
    if end_date:
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        tasks_query = tasks_query.filter(created_at__lte=end)
        projects_query = projects_query.filter(created_at__lte=end)
    
    # Project Progress Summaries
    project_summaries = []
    for project in projects_query:
        total_tasks = project.tasks.count()
        completed_tasks = project.tasks.filter(status='completed').count()
        in_progress_tasks = project.tasks.filter(status='in_progress').count()
        todo_tasks = project.tasks.filter(status='todo').count()
        
        completion_percentage = round((completed_tasks / total_tasks * 100), 2) if total_tasks > 0 else 0
        
        # User's tasks in this project
        user_tasks = project.tasks.filter(assigned_to=user)
        user_completed = user_tasks.filter(status='completed').count()
        
        project_summaries.append({
            'project_id': project.id,
            'project_name': project.title,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'todo_tasks': todo_tasks,
            'completion_percentage': completion_percentage,
            'created_by': f"{project.created_by.first_name} {project.created_by.last_name}",
            'is_owner': project.created_by == user,
            'member_count': project.members.count() + 1,
            'your_tasks': user_tasks.count(),
            'your_completed': user_completed,
        })
    
    # Task Completion Rates
    total_tasks = tasks_query.count()
    completed_tasks = tasks_query.filter(status='completed').count()
    in_progress_tasks = tasks_query.filter(status='in_progress').count()
    todo_tasks = tasks_query.filter(status='todo').count()
    
    overall_completion_rate = round((completed_tasks / total_tasks * 100), 2) if total_tasks > 0 else 0
    
    # Personal task stats
    my_tasks = tasks_query.filter(assigned_to=user)
    my_total = my_tasks.count()
    my_completed = my_tasks.filter(status='completed').count()
    my_in_progress = my_tasks.filter(status='in_progress').count()
    my_completion_rate = round((my_completed / my_total * 100), 2) if my_total > 0 else 0
    
    task_completion_rates = {
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'in_progress_tasks': in_progress_tasks,
        'todo_tasks': todo_tasks,
        'overall_completion_rate': overall_completion_rate,
        'my_tasks': {
            'total': my_total,
            'completed': my_completed,
            'in_progress': my_in_progress,
            'completion_rate': my_completion_rate
        }
    }
    
    # Team Member Productivity (only for projects user owns)
    owned_projects = projects_query.filter(created_by=user)
    member_productivity = []
    
    if owned_projects.exists():
        # Get all members from owned projects
        member_ids = set()
        for project in owned_projects:
            member_ids.add(project.created_by.id)
            member_ids.update(project.members.values_list('id', flat=True))
        
        members = User.objects.filter(id__in=member_ids, is_active=True)
        
        for member in members:
            member_tasks = tasks_query.filter(assigned_to=member, project__in=owned_projects)
            total_assigned = member_tasks.count()
            completed = member_tasks.filter(status='completed').count()
            in_progress = member_tasks.filter(status='in_progress').count()
            
            completion_rate = round((completed / total_assigned * 100), 2) if total_assigned > 0 else 0
            
            member_productivity.append({
                'user_id': member.id,
                'name': f"{member.first_name} {member.last_name}",
                'email': member.email,
                'total_tasks_assigned': total_assigned,
                'completed_tasks': completed,
                'in_progress_tasks': in_progress,
                'completion_rate': completion_rate,
            })
        
        member_productivity.sort(key=lambda x: x['completion_rate'], reverse=True)
    
    return Response({
        'project_summaries': project_summaries,
        'task_completion_rates': task_completion_rates,
        'member_productivity': member_productivity,
        'filters': {
            'start_date': start_date,
            'end_date': end_date,
            'project_id': project_id
        }
    })
