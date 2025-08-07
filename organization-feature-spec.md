# Wakana Organizations Feature Specification

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Models](#models)
4. [API Endpoints](#api-endpoints)
5. [Team Statistics Aggregation](#team-statistics-aggregation)
6. [UI/UX Mockups](#ui-ux-mockups)
7. [Implementation Phases](#implementation-phases)

## Overview

The Organizations feature allows users to create teams, invite members, and track collective coding activity. This specification outlines the technical implementation for adding organization support to Wakana.

### Key Features
- Organization creation and management
- Member invitation system
- Project-based activity tracking
- Admin dashboard with team statistics
- Flexible permission system

## Database Schema

### New Tables

```sql
-- Organizations table
CREATE TABLE organizations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_org_slug ON organizations(slug);
CREATE INDEX idx_org_created_by ON organizations(created_by);

-- Organization members table
CREATE TABLE organization_members (
    id BIGSERIAL PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invited_by VARCHAR(255),
    invitation_token VARCHAR(255) UNIQUE,
    invitation_accepted_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}',
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_token ON organization_members(invitation_token);

-- Organization projects table
CREATE TABLE organization_projects (
    id BIGSERIAL PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    added_by VARCHAR(255) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    visibility VARCHAR(50) DEFAULT 'organization', -- 'organization', 'public'
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE(organization_id, project_name)
);

CREATE INDEX idx_org_projects_org ON organization_projects(organization_id);
CREATE INDEX idx_org_projects_name ON organization_projects(project_name);

-- Organization invitations table (for pending invitations)
CREATE TABLE organization_invitations (
    id BIGSERIAL PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    invited_by VARCHAR(255) NOT NULL,
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_org_invitations_token ON organization_invitations(invitation_token);
CREATE INDEX idx_org_invitations_email ON organization_invitations(email);
```

## Models

### Organization Model

```go
// models/organization.go
package models

import (
    "time"
    "database/sql/driver"
)

type Organization struct {
    ID          string           `json:"id" gorm:"primary_key"`
    Name        string           `json:"name" gorm:"not null;size:255"`
    Slug        string           `json:"slug" gorm:"unique;not null;size:255"`
    Description string           `json:"description,omitempty"`
    CreatedBy   string           `json:"created_by" gorm:"not null"`
    CreatedAt   CustomTime       `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
    UpdatedAt   CustomTime       `json:"updated_at" gorm:"default:CURRENT_TIMESTAMP"`
    Settings    OrganizationSettings `json:"settings" gorm:"type:jsonb;default:'{}'"`
    IsActive    bool            `json:"is_active" gorm:"default:true;type:bool"`
    
    // Relations
    Creator     *User                 `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
    Members     []OrganizationMember  `json:"members,omitempty" gorm:"foreignKey:OrganizationID"`
    Projects    []OrganizationProject `json:"projects,omitempty" gorm:"foreignKey:OrganizationID"`
}

type OrganizationSettings struct {
    HeartbeatsTimeoutSec int    `json:"heartbeats_timeout_sec"`
    Timezone            string  `json:"timezone"`
    WeekStartDay        int     `json:"week_start_day"` // 0 = Sunday, 1 = Monday
    ShareProjects       bool    `json:"share_projects"`
    ShareLanguages      bool    `json:"share_languages"`
    ShareEditors        bool    `json:"share_editors"`
    ShareMachines       bool    `json:"share_machines"`
    ShareOSs            bool    `json:"share_oss"`
}

func (OrganizationSettings) Value() (driver.Value, error) {
    return json.Marshal(OrganizationSettings)
}

func (s *OrganizationSettings) Scan(value interface{}) error {
    bytes, ok := value.([]byte)
    if !ok {
        return errors.New("type assertion to []byte failed")
    }
    return json.Unmarshal(bytes, s)
}

type OrganizationMember struct {
    ID                    uint64        `json:"id" gorm:"primary_key"`
    OrganizationID        string        `json:"organization_id" gorm:"not null"`
    UserID                string        `json:"user_id" gorm:"not null"`
    Role                  string        `json:"role" gorm:"not null;default:'member'"`
    JoinedAt             CustomTime     `json:"joined_at" gorm:"default:CURRENT_TIMESTAMP"`
    InvitedBy            string         `json:"invited_by,omitempty"`
    InvitationToken      string         `json:"-" gorm:"unique"`
    InvitationAcceptedAt *CustomTime    `json:"invitation_accepted_at,omitempty"`
    IsActive             bool           `json:"is_active" gorm:"default:true;type:bool"`
    Permissions          MemberPermissions `json:"permissions" gorm:"type:jsonb;default:'{}'"`
    
    // Relations
    Organization *Organization `json:"organization,omitempty" gorm:"foreignKey:OrganizationID"`
    User        *User         `json:"user,omitempty" gorm:"foreignKey:UserID"`
    Inviter     *User         `json:"inviter,omitempty" gorm:"foreignKey:InvitedBy"`
}

type MemberPermissions struct {
    ViewStats       bool `json:"view_stats"`
    ManageProjects  bool `json:"manage_projects"`
    InviteMembers   bool `json:"invite_members"`
    ManageSettings  bool `json:"manage_settings"`
    ViewAllMembers  bool `json:"view_all_members"`
}

type OrganizationProject struct {
    ID             uint64      `json:"id" gorm:"primary_key"`
    OrganizationID string      `json:"organization_id" gorm:"not null"`
    ProjectName    string      `json:"project_name" gorm:"not null;size:255"`
    AddedBy        string      `json:"added_by" gorm:"not null"`
    AddedAt        CustomTime  `json:"added_at" gorm:"default:CURRENT_TIMESTAMP"`
    IsActive       bool        `json:"is_active" gorm:"default:true;type:bool"`
    Visibility     string      `json:"visibility" gorm:"default:'organization'"`
    
    // Relations
    Organization *Organization `json:"organization,omitempty" gorm:"foreignKey:OrganizationID"`
    AddedByUser  *User        `json:"added_by_user,omitempty" gorm:"foreignKey:AddedBy"`
}

type OrganizationInvitation struct {
    ID              uint64      `json:"id" gorm:"primary_key"`
    OrganizationID  string      `json:"organization_id" gorm:"not null"`
    Email           string      `json:"email" gorm:"not null;size:255"`
    Role            string      `json:"role" gorm:"not null;default:'member'"`
    InvitedBy       string      `json:"invited_by" gorm:"not null"`
    InvitationToken string      `json:"-" gorm:"unique;not null"`
    CreatedAt       CustomTime  `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
    ExpiresAt       CustomTime  `json:"expires_at" gorm:"not null"`
    AcceptedAt      *CustomTime `json:"accepted_at,omitempty"`
    
    // Relations
    Organization *Organization `json:"organization,omitempty" gorm:"foreignKey:OrganizationID"`
    Inviter      *User        `json:"inviter,omitempty" gorm:"foreignKey:InvitedBy"`
}

// Role constants
const (
    OrgRoleOwner  = "owner"
    OrgRoleAdmin  = "admin"
    OrgRoleMember = "member"
    OrgRoleViewer = "viewer"
)

// Permission helpers
func (m *OrganizationMember) CanViewStats() bool {
    return m.Role == OrgRoleOwner || m.Role == OrgRoleAdmin || m.Permissions.ViewStats
}

func (m *OrganizationMember) CanManageProjects() bool {
    return m.Role == OrgRoleOwner || m.Role == OrgRoleAdmin || m.Permissions.ManageProjects
}

func (m *OrganizationMember) CanInviteMembers() bool {
    return m.Role == OrgRoleOwner || m.Role == OrgRoleAdmin || m.Permissions.InviteMembers
}

func (m *OrganizationMember) CanManageSettings() bool {
    return m.Role == OrgRoleOwner || m.Role == OrgRoleAdmin || m.Permissions.ManageSettings
}

func (m *OrganizationMember) IsOwnerOrAdmin() bool {
    return m.Role == OrgRoleOwner || m.Role == OrgRoleAdmin
}
```

## API Endpoints

### Organization Management

```go
// routes/api/organization.go
package api

// Create organization
// POST /api/organizations
type CreateOrganizationRequest struct {
    Name        string `json:"name" binding:"required,min=3,max=255"`
    Slug        string `json:"slug" binding:"required,min=3,max=255,alphanum"`
    Description string `json:"description" binding:"max=1000"`
}

// Get user's organizations
// GET /api/users/current/organizations

// Get organization details
// GET /api/organizations/:slug

// Update organization
// PUT /api/organizations/:slug
type UpdateOrganizationRequest struct {
    Name        string                `json:"name" binding:"max=255"`
    Description string                `json:"description" binding:"max=1000"`
    Settings    *OrganizationSettings `json:"settings"`
}

// Delete organization
// DELETE /api/organizations/:slug

// Member Management
// GET /api/organizations/:slug/members
// POST /api/organizations/:slug/members/invite
type InviteMemberRequest struct {
    Email       string            `json:"email" binding:"required,email"`
    Role        string            `json:"role" binding:"required,oneof=admin member viewer"`
    Permissions MemberPermissions `json:"permissions"`
}

// PUT /api/organizations/:slug/members/:userId
type UpdateMemberRequest struct {
    Role        string            `json:"role" binding:"oneof=admin member viewer"`
    Permissions MemberPermissions `json:"permissions"`
}

// DELETE /api/organizations/:slug/members/:userId

// Project Management
// GET /api/organizations/:slug/projects
// POST /api/organizations/:slug/projects
type AddProjectRequest struct {
    ProjectName string `json:"project_name" binding:"required"`
    Visibility  string `json:"visibility" binding:"oneof=organization public"`
}

// DELETE /api/organizations/:slug/projects/:projectId

// Organization Statistics
// GET /api/organizations/:slug/stats
// GET /api/organizations/:slug/stats/summary
// GET /api/organizations/:slug/stats/contributors
// GET /api/organizations/:slug/stats/projects
```

### Repository Interface

```go
// repositories/organization.go
package repositories

type IOrganizationRepository interface {
    // Organization CRUD
    CreateOrganization(org *models.Organization) error
    GetOrganizationBySlug(slug string) (*models.Organization, error)
    GetOrganizationsByUser(userID string) ([]*models.Organization, error)
    UpdateOrganization(org *models.Organization) error
    DeleteOrganization(orgID string) error
    
    // Member management
    AddMember(member *models.OrganizationMember) error
    GetMemberByUserAndOrg(userID, orgID string) (*models.OrganizationMember, error)
    GetMembersByOrganization(orgID string) ([]*models.OrganizationMember, error)
    UpdateMember(member *models.OrganizationMember) error
    RemoveMember(orgID, userID string) error
    
    // Project management
    AddProject(project *models.OrganizationProject) error
    GetProjectsByOrganization(orgID string) ([]*models.OrganizationProject, error)
    RemoveProject(projectID uint64) error
    
    // Invitations
    CreateInvitation(invitation *models.OrganizationInvitation) error
    GetInvitationByToken(token string) (*models.OrganizationInvitation, error)
    AcceptInvitation(token string, userID string) error
    GetPendingInvitations(orgID string) ([]*models.OrganizationInvitation, error)
}
```

## Team Statistics Aggregation

### Approach 1: Real-time Aggregation

```go
// services/organization_stats.go
package services

type OrganizationStatsService struct {
    heartbeatRepo repositories.IHeartbeatRepository
    summaryRepo   repositories.ISummaryRepository
    orgRepo       repositories.IOrganizationRepository
}

func (s *OrganizationStatsService) GetOrganizationStats(orgID string, from, to time.Time) (*OrganizationStats, error) {
    // Get organization and its projects
    org, err := s.orgRepo.GetOrganizationBySlug(orgID)
    if err != nil {
        return nil, err
    }
    
    projects, err := s.orgRepo.GetProjectsByOrganization(org.ID)
    if err != nil {
        return nil, err
    }
    
    // Get all members
    members, err := s.orgRepo.GetMembersByOrganization(org.ID)
    if err != nil {
        return nil, err
    }
    
    // Aggregate stats for each member
    stats := &OrganizationStats{
        Organization: org,
        Period:       Period{From: from, To: to},
        TotalTime:    0,
        Contributors: make([]*ContributorStats, 0),
        Projects:     make([]*ProjectStats, 0),
    }
    
    // Collect heartbeats for each member's tracked projects
    projectNames := make([]string, len(projects))
    for i, p := range projects {
        projectNames[i] = p.ProjectName
    }
    
    for _, member := range members {
        if !member.IsActive {
            continue
        }
        
        // Get member's heartbeats for organization projects
        heartbeats, err := s.heartbeatRepo.GetByUserAndProjects(
            member.UserID, 
            projectNames,
            from,
            to,
        )
        
        if err != nil {
            continue
        }
        
        // Calculate member contribution
        contribution := s.calculateContribution(heartbeats)
        stats.Contributors = append(stats.Contributors, contribution)
        stats.TotalTime += contribution.TotalTime
    }
    
    // Aggregate by projects
    stats.Projects = s.aggregateByProjects(stats.Contributors)
    
    return stats, nil
}

type OrganizationStats struct {
    Organization *models.Organization    `json:"organization"`
    Period       Period                  `json:"period"`
    TotalTime    time.Duration          `json:"total_time"`
    Contributors []*ContributorStats    `json:"contributors"`
    Projects     []*ProjectStats        `json:"projects"`
    Languages    []*LanguageStats       `json:"languages"`
    DailyStats   []*DailyStats         `json:"daily_stats"`
}

type ContributorStats struct {
    User        *models.User           `json:"user"`
    TotalTime   time.Duration         `json:"total_time"`
    DailyAverage time.Duration        `json:"daily_average"`
    Projects    map[string]time.Duration `json:"projects"`
    Languages   map[string]time.Duration `json:"languages"`
}
```

### Approach 2: Pre-computed Summaries

```go
// models/organization_summary.go
package models

// Pre-computed organization summaries table
type OrganizationSummary struct {
    ID               uint64     `json:"id" gorm:"primary_key"`
    OrganizationID   string     `json:"organization_id" gorm:"not null;index:idx_org_summary"`
    Date             time.Time  `json:"date" gorm:"not null;index:idx_org_summary"`
    TotalSeconds     int64      `json:"total_seconds"`
    UniqueContributors int      `json:"unique_contributors"`
    ProjectStats     JSONB      `json:"project_stats" gorm:"type:jsonb"`
    LanguageStats    JSONB      `json:"language_stats" gorm:"type:jsonb"`
    ContributorStats JSONB      `json:"contributor_stats" gorm:"type:jsonb"`
    CreatedAt        CustomTime `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
    
    // Relations
    Organization *Organization `json:"organization,omitempty" gorm:"foreignKey:OrganizationID"`
}

// Background worker to compute daily summaries
func (w *OrganizationSummaryWorker) ComputeDailySummaries() {
    // Run daily at midnight
    organizations := w.orgRepo.GetActiveOrganizations()
    
    for _, org := range organizations {
        summary := w.computeOrganizationSummary(org, time.Now().AddDate(0, 0, -1))
        w.summaryRepo.SaveOrganizationSummary(summary)
    }
}
```

### Approach 3: Hybrid with Caching

```go
// services/organization_cache.go
package services

type OrganizationStatsCache struct {
    redis    *redis.Client
    statsService *OrganizationStatsService
}

func (c *OrganizationStatsCache) GetStats(orgID string, from, to time.Time) (*OrganizationStats, error) {
    // Check cache first
    cacheKey := fmt.Sprintf("org:stats:%s:%d:%d", orgID, from.Unix(), to.Unix())
    
    cached, err := c.redis.Get(cacheKey).Result()
    if err == nil {
        var stats OrganizationStats
        json.Unmarshal([]byte(cached), &stats)
        return &stats, nil
    }
    
    // Compute if not cached
    stats, err := c.statsService.GetOrganizationStats(orgID, from, to)
    if err != nil {
        return nil, err
    }
    
    // Cache for appropriate duration based on time range
    ttl := c.calculateTTL(from, to)
    data, _ := json.Marshal(stats)
    c.redis.Set(cacheKey, data, ttl)
    
    return stats, nil
}

func (c *OrganizationStatsCache) calculateTTL(from, to time.Time) time.Duration {
    duration := to.Sub(from)
    
    switch {
    case duration <= 24*time.Hour:
        return 15 * time.Minute // Today's data changes frequently
    case duration <= 7*24*time.Hour:
        return 1 * time.Hour // Week data moderately stable
    default:
        return 6 * time.Hour // Longer periods very stable
    }
}
```

## UI/UX Mockups

### Organization Dashboard (Low-Fi)

```
┌─────────────────────────────────────────────────────────────────┐
│ 🏢 Organization: Acme Corp                         [⚙️ Settings] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📊 Team Overview                            Period: [This Week ▼]│
│ ┌─────────────────────────────────────────────────────────────┐│
│ │                                                               ││
│ │ Total Time: 156 hrs 42 mins                                  ││
│ │                                                               ││
│ │ Active Contributors: 8/12                                     ││
│ │                                                               ││
│ │ Projects Tracked: 5                                          ││
│ │                                                               ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ 📈 Activity Timeline                                            │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │     ^                                                        ││
│ │  8h │    ╭─╮       ╭─────╮                                 ││
│ │  6h │ ╭──╯ ╰──╮ ╭──╯     ╰──╮      ╭───╮                  ││
│ │  4h │╭╯       ╰─╯           ╰──╮ ╭─╯   ╰─╮                ││
│ │  2h ├─────────────────────────────────────┤                ││
│ │     │ Mon  Tue  Wed  Thu  Fri  Sat  Sun  │                ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ 👥 Top Contributors                                             │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 1. Alice Johnson    ████████████████████ 42h 15m           ││
│ │ 2. Bob Smith        ████████████████ 38h 30m               ││
│ │ 3. Charlie Davis    ████████████ 28h 45m                   ││
│ │ 4. Diana Miller     ████████ 22h 10m                       ││
│ │                                         [View All →]        ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ 📁 Project Breakdown                                            │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ backend-api         ████████████████████████ 68h 20m       ││
│ │ frontend-app        ████████████████ 42h 15m               ││
│ │ mobile-ios          ████████ 22h 30m                       ││
│ │ docs-site           ████ 12h 45m                           ││
│ │ infrastructure      ██ 8h 52m                              ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Organization Settings Page

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back to Dashboard          Organization Settings              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📝 General Settings                                             │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Organization Name: [Acme Corp                            ]  ││
│ │ URL Slug:         [acme-corp                            ]  ││
│ │ Description:      [Building awesome products together    ]  ││
│ │                  [                                      ]  ││
│ │ Timezone:         [America/New_York               ▼]       ││
│ │                                          [Save Changes]     ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ 👥 Members (12)                                  [+ Invite New] │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Name              Email                Role      Actions    ││
│ │ ─────────────────────────────────────────────────────────  ││
│ │ Alice Johnson     alice@acme.com       Owner     [···]     ││
│ │ Bob Smith         bob@acme.com         Admin     [···]     ││
│ │ Charlie Davis     charlie@acme.com     Member    [···]     ││
│ │ Diana Miller      diana@acme.com       Member    [···]     ││
│ │                                                  [Load More]││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ 📁 Tracked Projects                              [+ Add Project]│
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ □ backend-api        Added by Alice      Public    [Remove]││
│ │ □ frontend-app       Added by Bob        Org Only  [Remove]││
│ │ □ mobile-ios         Added by Charlie    Org Only  [Remove]││
│ │ □ docs-site          Added by Diana      Public    [Remove]││
│ │ □ infrastructure     Added by Alice      Org Only  [Remove]││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ 🔒 Privacy Settings                                             │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ☑ Share project statistics within organization             ││
│ │ ☑ Share language statistics within organization            ││
│ │ ☑ Share editor statistics within organization              ││
│ │ ☐ Share machine statistics within organization             ││
│ │ ☐ Make organization profile public                         ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Member Invitation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Invite Team Members                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📧 Email Addresses (one per line)                               │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ john.doe@example.com                                        ││
│ │ jane.smith@example.com                                      ││
│ │ mike.wilson@example.com                                     ││
│ │                                                             ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ 👤 Default Role: [Member                                    ▼] │
│                                                                 │
│ 🔑 Permissions:                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ☑ View team statistics                                     ││
│ │ ☐ Manage projects                                          ││
│ │ ☐ Invite new members                                       ││
│ │ ☐ Manage organization settings                             ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ 💬 Personal Message (optional)                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Hey! Join our team on Wakana to track our coding time      ││
│ │ together. Looking forward to collaborating!                 ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│                              [Cancel] [Send Invitations →]      │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile-Responsive Team View

```
┌─────────────────────┐
│ 🏢 Acme Corp       │
│ ☰ Menu             │
├─────────────────────┤
│ Week: 156h 42m     │
│ Contributors: 8/12  │
├─────────────────────┤
│ 📊 Quick Stats      │
│ ┌───────────────────┤
│ │ Today: 22h 15m   │
│ │ ▓▓▓▓▓▓▓▓▓▓ 75%  │
│ │                  │
│ │ This Week:       │
│ │ M T W T F S S    │
│ │ ▅ █ ▇ █ ▆ ▂ ▁    │
│ └───────────────────┤
│                     │
│ 👥 Top Today        │
│ ┌───────────────────┤
│ │ Alice J. - 8h 20m│
│ │ Bob S.   - 6h 15m│
│ │ Charlie  - 4h 30m│
│ │ [See All →]      │
│ └───────────────────┤
│                     │
│ 📁 Active Projects  │
│ ┌───────────────────┤
│ │ • backend-api    │
│ │ • frontend-app   │
│ │ • mobile-ios     │
│ └───────────────────┤
└─────────────────────┘
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
- Database schema creation
- Basic models and repositories
- Organization CRUD operations
- Member management

### Phase 2: Integration (Week 3-4)
- Heartbeat filtering for organization projects
- Basic statistics aggregation
- API endpoints implementation
- Authentication/authorization middleware

### Phase 3: Dashboard UI (Week 5-6)
- Organization dashboard
- Member management interface
- Project tracking configuration
- Basic statistics visualization

### Phase 4: Advanced Features (Week 7-8)
- Email invitations
- Advanced permissions
- Real-time statistics updates
- Export functionality

### Phase 5: Optimization (Week 9-10)
- Caching implementation
- Performance optimization
- Background job for pre-computation
- Testing and bug fixes

## Security Considerations

1. **Authorization**: Implement proper role-based access control
2. **Data Isolation**: Ensure organization data is properly isolated
3. **Invitation Security**: Use secure tokens with expiration
4. **Rate Limiting**: Implement rate limits on invitation endpoints
5. **Audit Logging**: Log all organization-related actions

## Performance Considerations

1. **Indexing**: Proper database indexes on frequently queried fields
2. **Caching**: Redis caching for expensive aggregations
3. **Pagination**: Implement pagination for member/project lists
4. **Background Jobs**: Use workers for heavy computations
5. **Query Optimization**: Optimize N+1 queries in statistics

## Migration Strategy

1. Create new tables without affecting existing functionality
2. Add organization_id as nullable to existing tables initially
3. Provide UI for users to create/join organizations
4. Gradually migrate features to support organization context
5. Maintain backward compatibility throughout