# Sprint Module Architecture Diagram

## Overall Sprint Module Structure

```mermaid
graph TB
    subgraph "Frontend - React Components"
        A[SprintList Page] --> B[SprintDetail Page]
        B --> C[SprintKanbanBoard]
        B --> D[SprintBurndownChart]
        B --> E[SprintComments]
        B --> F[SprintRetrospective]
        B --> G[CreateTaskModal]
        B --> H[EditTaskModal]
        C --> I[TaskCard Component]
        C --> J[Column Component]
        C --> K[SubSection Component]
        E --> L[Comment Form]
        E --> M[Comment List]
    end

    subgraph "Backend - Django REST API"
        N[SprintViewSet] --> O[Sprint Model]
        P[SprintTaskViewSet] --> Q[SprintTask Model]
        R[sprint_comments API] --> S[SprintComment Model]
        T[sprint_retrospective API] --> U[SprintRetrospective Model]
        V[users_list API] --> W[User Model]
    end

    subgraph "Database - PostgreSQL"
        O --> X[(Sprint Table)]
        Q --> Y[(SprintTask Table)]
        S --> Z[(SprintComment Table)]
        U --> AA[(SprintRetrospective Table)]
        W --> AB[(User Table)]
    end

    A --> N
    C --> P
    E --> R
    F --> T
    G --> P
    H --> P

    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#fff4e1
    style D fill:#fff4e1
    style E fill:#fff4e1
    style F fill:#fff4e1
    style N fill:#e8f5e9
    style P fill:#e8f5e9
    style R fill:#e8f5e9
    style T fill:#e8f5e9
```

## Component Hierarchy

```mermaid
graph TD
    A[App.jsx] --> B[Layout Component]
    B --> C[Sidebar Component]
    B --> D[Outlet - Route Content]
    
    D --> E[SprintList Page]
    D --> F[SprintDetail Page]
    
    F --> G[Tabs Container]
    G --> H[Tasks Tab]
    G --> I[Progress Tab]
    G --> J[Comments Tab]
    G --> K[Retrospective Tab]
    
    H --> L[SprintKanbanBoard]
    L --> M[Search & Filter Bar]
    L --> N[Column: TO DO]
    L --> O[Column: IN PROGRESS]
    L --> P[Column: IN REVIEW]
    L --> Q[Column: DONE]
    
    O --> R[SubSection: PENDING]
    O --> S[SubSection: IN PROGRESS]
    
    N --> T[TaskCard]
    R --> T
    S --> T
    P --> T
    Q --> T
    
    I --> U[SprintBurndownChart]
    J --> V[SprintComments]
    K --> W[SprintRetrospective]
    
    V --> X[Comment Form]
    V --> Y[Comment List]
    V --> Z[Search & Filter]
    
    style A fill:#ffebee
    style B fill:#e3f2fd
    style F fill:#fff3e0
    style L fill:#f3e5f5
    style V fill:#e8f5e9
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant SprintList
    participant SprintDetail
    participant SprintKanbanBoard
    participant API
    participant Database

    User->>SprintList: Navigate to /sprints
    SprintList->>API: GET /sprints/
    API->>Database: Query Sprint Table
    Database-->>API: Sprint Data
    API-->>SprintList: JSON Response
    SprintList-->>User: Display Sprint List

    User->>SprintDetail: Click on Sprint
    SprintDetail->>API: GET /sprints/:id/
    API->>Database: Query Sprint + Tasks
    Database-->>API: Sprint & Tasks Data
    API-->>SprintDetail: JSON Response
    SprintDetail-->>User: Display Sprint Details

    User->>SprintKanbanBoard: Drag & Drop Task
    SprintKanbanBoard->>SprintKanbanBoard: Update Local State
    SprintKanbanBoard->>API: PATCH /sprint-tasks/:id/
    API->>Database: Update Task Status
    Database-->>API: Success
    API-->>SprintKanbanBoard: Updated Task
    SprintKanbanBoard-->>User: Show Success Message

    User->>SprintComments: Add Comment
    SprintComments->>API: POST /sprints/:id/comments/
    API->>Database: Insert Comment
    Database-->>API: Comment Data
    API-->>SprintComments: New Comment
    SprintComments-->>User: Display Comment
```

## API Endpoints Structure

```mermaid
graph LR
    A[Base URL: /api/sprint/] --> B[Sprints]
    A --> C[Sprint Tasks]
    A --> D[Sprint Comments]
    A --> E[Sprint Retrospective]
    A --> F[Users]
    
    B --> B1[GET /sprints/ - List]
    B --> B2[GET /sprints/:id/ - Detail]
    B --> B3[POST /sprints/ - Create]
    B --> B4[PATCH /sprints/:id/ - Update]
    B --> B5[DELETE /sprints/:id/ - Delete]
    
    C --> C1[GET /sprint-tasks/ - List]
    C --> C2[GET /sprint-tasks/:id/ - Detail]
    C --> C3[POST /sprint-tasks/ - Create]
    C --> C4[PATCH /sprint-tasks/:id/ - Update]
    C --> C5[DELETE /sprint-tasks/:id/ - Delete]
    
    D --> D1[GET /sprints/:id/comments/ - List]
    D --> D2[POST /sprints/:id/comments/ - Create]
    D --> D3[GET /sprints/:id/comments/:id/ - Detail]
    D --> D4[PUT /sprints/:id/comments/:id/ - Update]
    D --> D5[DELETE /sprints/:id/comments/:id/ - Delete]
    
    E --> E1[GET /sprints/:id/retrospective/ - Get]
    E --> E2[POST /sprints/:id/retrospective/ - Create/Update]
    
    F --> F1[GET /sprint-users/ - List Users]
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#fff4e1
    style D fill:#e8f5e9
    style E fill:#f3e5f5
    style F fill:#fce4ec
```

## Task Status Flow (Kanban Board)

```mermaid
stateDiagram-v2
    [*] --> TODO: Create Task
    TODO --> PENDING: Move to Pending
    TODO --> IN_PROGRESS: Start Work
    PENDING --> IN_PROGRESS: Resume Work
    IN_PROGRESS --> IN_REVIEW: Submit for Review
    IN_PROGRESS --> PENDING: Put on Hold
    IN_REVIEW --> IN_PROGRESS: Request Changes
    IN_REVIEW --> DONE: Approve
    DONE --> [*]
    
    note right of TODO
        Initial state
        when task is created
    end note
    
    note right of PENDING
        Task is waiting
        or on hold
    end note
    
    note right of IN_PROGRESS
        Active work
        in progress
    end note
    
    note right of IN_REVIEW
        Under review
        or testing
    end note
    
    note right of DONE
        Task completed
        and approved
    end note
```

## Database Schema Relationships

```mermaid
erDiagram
    SPRINT ||--o{ SPRINT_TASK : has
    SPRINT ||--o| SPRINT_COMMENT : has
    SPRINT ||--o| SPRINT_RETROSPECTIVE : has
    USER ||--o{ SPRINT_TASK : assigned_to
    USER ||--o{ SPRINT_COMMENT : created_by
    PROJECT ||--o{ SPRINT : belongs_to
    
    SPRINT {
        int id PK
        string name
        string description
        date start_date
        date end_date
        string status
        int project_id FK
        datetime created_at
        datetime updated_at
    }
    
    SPRINT_TASK {
        int id PK
        string title
        text description
        string status
        string priority
        int sprint_id FK
        int assigned_to_id FK
        date due_date
        datetime created_at
        datetime updated_at
    }
    
    SPRINT_COMMENT {
        int id PK
        text content
        int sprint_id FK
        int user_id FK
        datetime created_at
        datetime updated_at
    }
    
    SPRINT_RETROSPECTIVE {
        int id PK
        text what_went_well
        text what_could_improve
        text action_items
        int sprint_id FK
        datetime created_at
        datetime updated_at
    }
    
    USER {
        int id PK
        string username
        string email
        string first_name
        string last_name
    }
    
    PROJECT {
        int id PK
        string title
        string description
    }
```

## Feature Breakdown

```mermaid
mindmap
  root((Sprint Module))
    Sprint Management
      Create Sprint
      Edit Sprint
      Delete Sprint
      View Sprint List
      View Sprint Details
    Task Management
      Create Task
      Edit Task
      Delete Task
      Drag & Drop Tasks
      Task Status Updates
      Task Assignment
      Task Priority
      Task Due Dates
    Kanban Board
      TO DO Column
      PENDING Sub-section
      IN PROGRESS Sub-section
      IN REVIEW Column
      DONE Column
      Search & Filter
      Real-time Updates
    Progress Tracking
      Burndown Chart
      Ideal vs Actual
      Progress Percentage
      Remaining Days
    Collaboration
      Comments System
      Markdown Support
      Edit Comments
      Delete Comments
      Search Comments
      Filter by User
    Retrospective
      What Went Well
      What Could Improve
      Action Items
      Save Retrospective
```

## User Interaction Flow

```mermaid
flowchart TD
    Start([User Opens App]) --> Login{Logged In?}
    Login -->|No| LoginPage[Login Page]
    Login -->|Yes| Dashboard[Dashboard]
    
    Dashboard --> SprintList[Sprint List Page]
    SprintList --> ViewSprint[View Sprint Details]
    SprintList --> CreateSprint[Create New Sprint]
    
    ViewSprint --> SprintDetail[Sprint Detail Page]
    SprintDetail --> TasksTab[Tasks Tab]
    SprintDetail --> ProgressTab[Progress Tab]
    SprintDetail --> CommentsTab[Comments Tab]
    SprintDetail --> RetroTab[Retrospective Tab]
    
    TasksTab --> KanbanBoard[Kanban Board]
    KanbanBoard --> CreateTask[Create Task]
    KanbanBoard --> EditTask[Edit Task]
    KanbanBoard --> DeleteTask[Delete Task]
    KanbanBoard --> DragDrop[Drag & Drop Task]
    
    ProgressTab --> BurndownChart[View Burndown Chart]
    
    CommentsTab --> AddComment[Add Comment]
    CommentsTab --> EditComment[Edit Comment]
    CommentsTab --> DeleteComment[Delete Comment]
    CommentsTab --> SearchComments[Search Comments]
    
    RetroTab --> ViewRetro[View Retrospective]
    RetroTab --> EditRetro[Edit Retrospective]
    
    CreateSprint --> SprintDetail
    CreateTask --> KanbanBoard
    EditTask --> KanbanBoard
    DragDrop --> KanbanBoard
    AddComment --> CommentsTab
    EditComment --> CommentsTab
    
    style Start fill:#e1f5ff
    style SprintDetail fill:#fff4e1
    style KanbanBoard fill:#f3e5f5
    style BurndownChart fill:#e8f5e9
    style CommentsTab fill:#fce4ec
```

## Technology Stack

```mermaid
graph TB
    subgraph "Frontend"
        A[React 19] --> B[Material-UI]
        A --> C[React Router]
        A --> D[dnd-kit]
        A --> E[Axios]
        A --> F[Day.js]
        A --> G[react-markdown]
    end
    
    subgraph "Backend"
        H[Django 4.x] --> I[Django REST Framework]
        I --> J[PostgreSQL]
        I --> K[JWT Authentication]
    end
    
    subgraph "Features"
        L[Drag & Drop] --> D
        M[Real-time Updates] --> A
        N[Markdown Support] --> G
        O[Chart Visualization] --> P[Recharts/Chart.js]
    end
    
    style A fill:#61dafb
    style H fill:#092e20
    style J fill:#336791
```

---

## Key Features Summary

### 1. **Sprint Management**
   - Create, Read, Update, Delete sprints
   - Sprint status tracking (Active, Completed, Upcoming)
   - Sprint duration and progress tracking

### 2. **Task Management**
   - Full CRUD operations for tasks
   - Drag-and-drop task status updates
   - Task assignment to team members
   - Priority levels (High, Medium, Low)
   - Due date tracking with overdue indicators

### 3. **Kanban Board**
   - 5 main columns: TO DO, IN PROGRESS (with PENDING and IN PROGRESS sub-sections), IN REVIEW, DONE
   - Real-time drag-and-drop functionality
   - Search and filter capabilities
   - Task cards with detailed information

### 4. **Progress Tracking**
   - Burndown chart visualization
   - Ideal vs Actual remaining tasks comparison
   - Progress percentage calculation
   - Remaining days calculation

### 5. **Comments System**
   - Add, edit, delete comments
   - Markdown support for rich text
   - Search and filter comments
   - User filtering
   - Auto-refresh functionality

### 6. **Retrospective**
   - What went well section
   - What could improve section
   - Action items tracking
   - Save and update functionality

---

## File Structure

```
frontend/src/
├── pages/Sprints/
│   ├── SprintList.jsx          # Sprint list page
│   └── SprintDetail.jsx        # Sprint detail page
├── components/Sprints/
│   ├── SprintKanbanBoard.jsx   # Kanban board component
│   ├── SprintBurndownChart.jsx # Burndown chart component
│   ├── SprintComments.jsx       # Comments component
│   ├── SprintRetrospective.jsx # Retrospective component
│   ├── CreateTaskModal.jsx     # Create task modal
│   └── EditTaskModal.jsx       # Edit task modal

backend/project_management/sprint/
├── models.py                   # Database models
├── views.py                    # API views
├── serializers.py              # Data serializers
├── urls.py                     # URL routing
└── migrations/                 # Database migrations
```

---

*This diagram provides a comprehensive overview of the Sprint Module architecture, data flow, and component relationships.*

