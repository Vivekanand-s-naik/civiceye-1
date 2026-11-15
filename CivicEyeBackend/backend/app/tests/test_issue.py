"""
Issue Tests

Tests for issue creation and management.
"""

import pytest
from app.models import Issue, IssueCategory, IssueStatus


def test_issue_creation():
    """Test issue model creation"""
    issue = Issue(
        user_id=1,
        title="Test Issue",
        description="This is a test issue",
        category=IssueCategory.TRAFFIC_VIOLATION,
        status=IssueStatus.PENDING
    )
    
    assert issue.title == "Test Issue"
    assert issue.category == IssueCategory.TRAFFIC_VIOLATION
    assert issue.status == IssueStatus.PENDING


def test_issue_status_transitions():
    """Test issue status lifecycle"""
    issue = Issue(
        user_id=1,
        title="Test",
        description="Test",
        category=IssueCategory.LITTERING,
        status=IssueStatus.PENDING
    )
    
    # Transition to in_progress
    issue.status = IssueStatus.IN_PROGRESS
    assert issue.status == IssueStatus.IN_PROGRESS
    
    # Transition to resolved
    issue.status = IssueStatus.RESOLVED
    assert issue.status == IssueStatus.RESOLVED
