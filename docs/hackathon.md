# Hackathon II Documentation
**The Evolution of Todo – Mastering Spec-Driven Development & Cloud Native AI**

---

## Table of Contents

1. [Overview](#overview)
2. [Learning Objectives](#learning-objectives)
3. [Eligibility & Opportunity](#eligibility--opportunity)
4. [Project Requirements](#project-requirements)
5. [Todo App Feature Progression](#todo-app-feature-progression)
6. [Hackathon Phases](#hackathon-phases)
7. [Bonus Points](#bonus-points)
8. [Timeline & Submission](#timeline--submission)
9. [Phase Details](#phase-details)
   - [Phase I: Python Console App](#phase-i-python-console-app)
   - [Phase II: Full-Stack Web Application](#phase-ii-full-stack-web-application)
   - [Phase III: AI Chatbot](#phase-iii-ai-chatbot)
   - [Phase IV: Local Kubernetes Deployment](#phase-iv-local-kubernetes-deployment)
   - [Phase V: Advanced Cloud Deployment](#phase-v-advanced-cloud-deployment)
10. [Technical Guides](#technical-guides)
11. [Resources](#resources)
12. [FAQ](#faq)

---

## Overview

The future of software development is AI-native and spec-driven. As AI agents like Claude Code become more powerful, the role of the engineer shifts from "syntax writer" to "system architect."

In this hackathon, you will master the art of building applications iteratively—starting from a simple console app and evolving it into a fully-featured, cloud-native AI chatbot deployed on Kubernetes. This journey will teach you the **Nine Pillars of AI-Driven Development**, Claude Code, Spec-Driven Development with Reusable Intelligence, and Cloud-Native AI technologies through hands-on implementation.

---

## Learning Objectives

You will learn:

- ✅ **Spec-Driven Development** using Claude Code and Spec-Kit Plus
- ✅ **Reusable Intelligence**: Agents, Skills, and Subagent Development
- ✅ **Full-Stack Development** with Next.js, FastAPI, SQLModel, and Neon Serverless Database
- ✅ **AI Agent Development** using OpenAI Agents SDK and Official MCP SDK
- ✅ **Cloud-Native Deployment** with Docker, Kubernetes, Minikube, and Helm Charts
- ✅ **Event-Driven Architecture** using Kafka and Dapr
- ✅ **AIOps** with kubectl-ai, kagent, and Claude Code
- ✅ **Cloud-Native Blueprints** for Spec-Driven Deployment

---

## Eligibility & Opportunity

### Excel in the Hackathon and Launch Your Journey as an AI Startup Founder 🚀

We've recently launched **Panaversity** ([panaversity.org](https://panaversity.org)), an initiative focused on teaching cutting-edge AI courses.

**If you perform well in this hackathon**, you may be invited for an interview to:
- Join the Panaversity core team
- Step into the role of a startup founder within this growing ecosystem
- Work with Panaversity founders: Zia, Rehan, Junaid, and Wania
- Teach at Panaversity, PIAIC, and GIAIC

---

## Project Requirements

You are required to complete the **5-Phase "Evolution of Todo" Project** using Claude Code and Spec-Kit Plus.

### Core Deliverables

1. **Spec-Driven Implementation**
   - Implement all 5 Phases of the project
   - Use Spec-Driven Development strictly
   - Write a Markdown Constitution and Spec for every feature
   - Use Claude Code to generate implementation

2. **Constraint**: You **cannot write code manually**. You must refine the Spec until Claude Code generates the correct output.

3. **Integrated AI Chatbot** (Phases III, IV, V)
   - Implement conversational interface using OpenAI ChatKit, OpenAI Agents SDK, and Official MCP SDK
   - Bot must manage Todo list via natural language (e.g., "Reschedule my morning meetings to 2 PM")

4. **Cloud Native Deployment** (Phases IV, V)
   - Deploy chatbot locally on Minikube
   - Deploy on cloud (DigitalOcean Kubernetes/DOKS)

---

## Todo App Feature Progression

### Basic Level (Core Essentials)
Foundation features—quick to build, essential for any MVP:
- ✅ Add Task
- ✅ Delete Task
- ✅ Update Task
- ✅ View Task List
- ✅ Mark as Complete

### Intermediate Level (Organization & Usability)
Makes the app feel polished and practical:
- 📋 Priorities & Tags/Categories
- 🔍 Search & Filter
- 📊 Sort Tasks

### Advanced Level (Intelligent Features)
- 🔁 Recurring Tasks
- ⏰ Due Dates & Time Reminders

---

## Hackathon Phases

| Phase | Description | Technology Stack | Points | Due Date |
|-------|-------------|------------------|--------|----------|
| **Phase I** | In-Memory Python Console App | Python, Claude Code, Spec-Kit Plus | 100 | Dec 7, 2025 |
| **Phase II** | Full-Stack Web Application | Next.js, FastAPI, SQLModel, Neon DB | 150 | Dec 14, 2025 |
| **Phase III** | AI-Powered Todo Chatbot | OpenAI ChatKit, Agents SDK, MCP SDK | 200 | Dec 21, 2025 |
| **Phase IV** | Local Kubernetes Deployment | Docker, Minikube, Helm, kubectl-ai, kagent | 250 | Jan 4, 2026 |
| **Phase V** | Advanced Cloud Deployment | Kafka, Dapr, DigitalOcean DOKS | 300 | Jan 18, 2026 |
| **TOTAL** | | | **1,000** | |

---

## Bonus Points

| Bonus Feature | Points |
|---------------|--------|
| Reusable Intelligence – Create and use reusable intelligence via Claude Code Subagents and Agent Skills | +200 |
| Create and use Cloud-Native Blueprints via Agent Skills | +200 |
| Multi-language Support – Support Urdu in chatbot | +100 |
| Voice Commands – Add voice input for todo commands | +200 |
| **TOTAL BONUS** | **+600** |

---

## Timeline & Submission

### Important Dates

| Milestone | Date | Description |
|-----------|------|-------------|
| Hackathon Start | Monday, Dec 1, 2025 | Documentation released |
| Phase I Due | Sunday, Dec 7, 2025 | Console app checkpoint |
| Phase II Due | Sunday, Dec 14, 2025 | Web app checkpoint |
| Phase III Due | Sunday, Dec 21, 2025 | Chatbot checkpoint |
| Phase IV Due | Sunday, Jan 4, 2026 | Local K8s checkpoint |
| Final Submission | Sunday, Jan 18, 2026 | All phases complete |
| Live Presentations | Sundays: Dec 7, 14, 21, Jan 4, 18 | Top submissions present |

### Submission Process

Submit your project at each phase via: **https://forms.gle/KMKEKaFUD6ZX4UtY8**

**Required for each phase:**
1. Public GitHub Repo Link
2. Published App Link (Vercel for frontend)
3. Demo video link (max 90 seconds - judges only watch first 90 seconds)
4. WhatsApp number (for presentation invitation)

### Live Presentations

**Time:** 8:00 PM on Sundays
**Zoom Link:** https://us06web.zoom.us/j/84976847088?pwd=Z7t7NaeXwVmmR5fysCv7NiMbfbhIda.1
**Meeting ID:** 849 7684 7088
**Passcode:** 305850

- Top submissions will be invited via WhatsApp to present live
- Everyone is welcome to join and watch
- Live presentation is by invitation only but doesn't affect final scoring

---

## Phase Details

### Phase I: Python Console App

**Objective:** Build a command-line todo application that stores tasks in memory using Claude Code and Spec-Kit Plus.

**💡 Development Approach:** Use the Agentic Dev Stack workflow:
`Write spec → Generate plan → Break into tasks → Implement via Claude Code`

**No manual coding allowed.**

#### Requirements
- Implement all 5 Basic Level features
- Use spec-driven development with Claude Code and Spec-Kit Plus
- Follow clean code principles and proper Python project structure

#### Technology Stack
- UV
- Python 3.13+
- Claude Code
- Spec-Kit Plus

#### Deliverables

**GitHub repository with:**
- Constitution file
- `specs/` history folder containing all specification files
- `/src` folder with Python source code
- README.md with setup instructions
- CLAUDE.md with Claude Code instructions

**Working console application demonstrating:**
- Adding tasks with title and description
- Listing all tasks with status indicators
- Updating task details
- Deleting tasks by ID
- Marking tasks as complete/incomplete

#### Windows Users: WSL 2 Setup

Windows users must use WSL 2 for development:

```bash
# Install WSL 2
wsl --install

# Set WSL 2 as default
wsl --set-default-version 2

# Install Ubuntu
wsl --install -d Ubuntu-22.04
```

---

### Phase II: Full-Stack Web Application

**Objective:** Transform the console app into a modern multi-user web application with persistent storage using Claude Code and Spec-Kit Plus.

**💡 Development Approach:** Use the Agentic Dev Stack workflow: `Write spec → Generate plan → Break into tasks → Implement via Claude Code`

#### Requirements
- Implement all 5 Basic Level features as a web application
- Create RESTful API endpoints
- Build responsive frontend interface
- Store data in Neon Serverless PostgreSQL database
- Authentication using Better Auth

#### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16+ (App Router) |
| Backend | Python FastAPI |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Spec-Driven | Claude Code + Spec-Kit Plus |
| Authentication | Better Auth |

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List all tasks |
| POST | `/api/{user_id}/tasks` | Create a new task |
| GET | `/api/{user_id}/tasks/{id}` | Get task details |
| PUT | `/api/{user_id}/tasks/{id}` | Update a task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete a task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion |

#### Securing the REST API

**Better Auth + FastAPI Integration**

**The Challenge:**
Better Auth is a JavaScript/TypeScript authentication library running on Next.js frontend. Your FastAPI backend needs to verify which user is making API requests.

**The Solution: JWT Tokens**

Better Auth issues JWT tokens when users log in. These tokens are self-contained credentials including user information, verifiable by any service that knows the secret key.

**How It Works:**
1. User logs in on Frontend → Better Auth creates session and issues JWT token
2. Frontend makes API call → Includes JWT token in `Authorization: Bearer <token>` header
3. Backend receives request → Extracts token, verifies signature using shared secret
4. Backend identifies user → Decodes token to get user ID, email, matches with URL user ID
5. Backend filters data → Returns only tasks belonging to that user

**What Needs to Change:**

| Component | Changes Required |
|-----------|------------------|
| Better Auth Config | Enable JWT plugin to issue tokens |
| Frontend API Client | Attach JWT token to every API request header |
| FastAPI Backend | Add middleware to verify JWT and extract user |
| API Routes | Filter all queries by authenticated user's ID |

**The Shared Secret:**
Both frontend and backend must use the same secret key (`BETTER_AUTH_SECRET`) for JWT signing and verification.

**Security Benefits:**
- User Isolation: Each user only sees their own tasks
- Stateless Auth: Backend doesn't need to call frontend to verify users
- Token Expiry: JWTs expire automatically
- No Shared DB Session: Independent auth verification

#### Monorepo Organization

Organize your Full-Stack Project in a monorepo to integrate GitHub Spec-Kit + Claude Code effectively.

**Folder Structure:**

```
hackathon-todo/
├── .spec-kit/
│   └── config.yaml
├── specs/
│   ├── overview.md
│   ├── architecture.md
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
├── CLAUDE.md
├── frontend/
│   ├── CLAUDE.md
│   └── ... (Next.js app)
├── backend/
│   ├── CLAUDE.md
│   └── ... (FastAPI app)
├── docker-compose.yml
└── README.md
```

**Key Benefits:**
- Single Context: Claude Code sees entire project
- Layered CLAUDE.md: Root overview + subfolder specifics
- Specs Folder: Reference with `@specs/filename.md`
- Clear Separation: Frontend/backend in separate folders

---

### Phase III: AI Chatbot

**Objective:** Create an AI-powered chatbot interface for managing todos through natural language using MCP (Model Context Protocol) server architecture.

**💡 Development Approach:** Use the Agentic Dev Stack workflow: `Write spec → Generate plan → Break into tasks → Implement via Claude Code`

#### Requirements
- Implement conversational interface for all Basic Level features
- Use OpenAI Agents SDK for AI logic
- Build MCP server with Official MCP SDK exposing task operations as tools
- Stateless chat endpoint persisting conversation state to database
- AI agents use MCP tools to manage tasks

#### Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | OpenAI ChatKit |
| Backend | Python FastAPI |
| AI Framework | OpenAI Agents SDK |
| MCP Server | Official MCP SDK |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Authentication | Better Auth |

#### Architecture

```
┌─────────────────┐     ┌──────────────────────────────────┐     ┌─────────────────┐
│                 │     │      FastAPI Server              │     │                 │
│  ChatKit UI     │────▶│  ┌────────────────────────────┐  │     │    Neon DB      │
│  (Frontend)     │     │  │   Chat Endpoint            │  │     │  (PostgreSQL)   │
│                 │     │  │   POST /api/chat           │  │     │                 │
│                 │     │  └──────────┬─────────────────┘  │     │  - tasks        │
│                 │     │             ▼                    │     │  - conversations│
│                 │     │  ┌────────────────────────────┐  │     │  - messages     │
│                 │◀────│  │  OpenAI Agents SDK         │  │     │                 │
│                 │     │  │  (Agent + Runner)          │  │     │                 │
│                 │     │  └──────────┬─────────────────┘  │     │                 │
│                 │     │             ▼                    │     │                 │
│                 │     │  ┌────────────────────────────┐  │────▶│                 │
│                 │     │  │      MCP Server            │  │◀────│                 │
│                 │     │  │  (Task Operations Tools)   │  │     │                 │
│                 │     │  └────────────────────────────┘  │     │                 │
└─────────────────┘     └──────────────────────────────────┘     └─────────────────┘
```

#### Database Models

| Model | Fields | Description |
|-------|--------|-------------|
| Task | user_id, id, title, description, completed, created_at, updated_at | Todo items |
| Conversation | user_id, id, created_at, updated_at | Chat session |
| Message | user_id, id, conversation_id, role, content, created_at | Chat history |

#### Chat API Endpoint

**POST** `/api/{user_id}/chat`

**Request:**
- `conversation_id` (integer, optional): Existing conversation ID
- `message` (string, required): User's natural language message

**Response:**
- `conversation_id` (integer): The conversation ID
- `response` (string): AI assistant's response
- `tool_calls` (array): List of MCP tools invoked

#### MCP Tools Specification

**Available Tools:**
1. `add_task` - Create a new task
2. `list_tasks` - Retrieve tasks
3. `complete_task` - Mark task as complete
4. `delete_task` - Remove a task
5. `update_task` - Modify task details

#### Natural Language Commands

| User Says | Agent Should |
|-----------|--------------|
| "Add a task to buy groceries" | Call `add_task` with title "Buy groceries" |
| "Show me all my tasks" | Call `list_tasks` with status "all" |
| "What's pending?" | Call `list_tasks` with status "pending" |
| "Mark task 3 as complete" | Call `complete_task` with task_id 3 |
| "Delete the meeting task" | Call `list_tasks` first, then `delete_task` |
| "Change task 1 to 'Call mom tonight'" | Call `update_task` with new title |

#### Stateless Architecture Benefits
- **Scalability**: Any server instance can handle any request
- **Resilience**: Server restarts don't lose conversation state
- **Horizontal scaling**: Load balancer can route to any backend
- **Testability**: Each request is independent and reproducible

#### OpenAI ChatKit Setup

**Domain Allowlist Configuration (Required):**

1. Deploy frontend first to get production URL
2. Add domain to OpenAI's allowlist: https://platform.openai.com/settings/organization/security/domain-allowlist
3. Get your ChatKit domain key
4. Set environment variable: `NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key-here`

---

### Phase IV: Local Kubernetes Deployment

**Objective:** Deploy the Todo Chatbot on local Kubernetes cluster using Minikube and Helm Charts.

**💡 Development Approach:** Use the Agentic Dev Stack workflow: `Write spec → Generate plan → Break into tasks → Implement via Claude Code`

#### Requirements
- Containerize frontend and backend applications (Use Gordon)
- Use Docker AI Agent (Gordon) for AI-assisted Docker operations
- Create Helm charts for deployment (Use kubectl-ai and/or kagent)
- Deploy on Minikube locally

#### Technology Stack

| Component | Technology |
|-----------|------------|
| Containerization | Docker (Docker Desktop) |
| Docker AI | Docker AI Agent (Gordon) |
| Orchestration | Kubernetes (Minikube) |
| Package Manager | Helm Charts |
| AI DevOps | kubectl-ai, kagent |
| Application | Phase III Todo Chatbot |

#### AIOps Tools

**Docker AI Agent (Gordon):**
```bash
# To know its capabilities
docker ai "What can you do?"
```

Enable Gordon: Install Docker Desktop 4.53+, go to Settings > Beta features, toggle on.

**kubectl-ai and kagent:**
```bash
# Using kubectl-ai
kubectl-ai "deploy the todo frontend with 2 replicas"
kubectl-ai "scale the backend to handle more load"
kubectl-ai "check why the pods are failing"

# Using kagent
kagent "analyze the cluster health"
kagent "optimize resource allocation"
```

---

### Phase V: Advanced Cloud Deployment

**Objective:** Implement advanced features and deploy to production-grade Kubernetes on Azure/Google Cloud/Oracle with Kafka.

**💡 Development Approach:** Use the Agentic Dev Stack workflow: `Write spec → Generate plan → Break into tasks → Implement via Claude Code`

#### Part A: Advanced Features
- Implement all Advanced Level features (Recurring Tasks, Due Dates & Reminders)
- Implement Intermediate Level features (Priorities, Tags, Search, Filter, Sort)
- Add event-driven architecture with Kafka
- Implement Dapr for distributed application runtime

#### Part B: Local Deployment
- Deploy to Minikube
- Deploy Dapr on Minikube (Full Dapr: Pub/Sub, State, Bindings, Secrets, Service Invocation)

#### Part C: Cloud Deployment
- Deploy to Azure (AKS)/Google Cloud (GKE)/Oracle (OKE)
- Deploy Dapr on cloud cluster
- Use Kafka (Confluent/Redpanda Cloud or other PubSub with Dapr)
- Set up CI/CD pipeline using GitHub Actions
- Configure monitoring and logging

#### Cloud Provider Options

**Oracle Cloud (Recommended - Always Free):**
- Sign up: https://www.oracle.com/cloud/free/
- Create OKE cluster (4 OCPUs, 24GB RAM - always free)
- No credit card charge after trial
- Best for learning without time pressure

**Microsoft Azure (AKS):**
- US$200 credits for 30 days + 12 months selected free services
- Sign up: https://azure.microsoft.com/en-us/free/

**Google Cloud (GKE):**
- US$300 credits, usable for 90 days
- Sign up: https://cloud.google.com/free

#### Kafka Use Cases

**1. Reminder/Notification System**
```
Todo Service → Kafka Topic "reminders" → Notification Service → User Device
```

**2. Recurring Task Engine**
```
Task Completed Event → Kafka "task-events" → Recurring Task Service (Creates next)
```

**3. Activity/Audit Log**
```
All Task Operations → Kafka "task-events" → Audit Service (Stores log)
```

**4. Real-time Sync Across Clients**
```
Task Changed → Kafka "task-updates" → WebSocket Service → All Connected Clients
```

#### Kafka Topics

| Topic | Producer | Consumer | Purpose |
|-------|----------|----------|---------|
| task-events | Chat API (MCP Tools) | Recurring Task Service, Audit Service | All task CRUD operations |
| reminders | Chat API (when due date set) | Notification Service | Scheduled reminder triggers |
| task-updates | Chat API | WebSocket Service | Real-time client sync |

#### Kafka Service Recommendations

**For Cloud Deployment:**

| Service | Free Tier | Pros | Cons |
|---------|-----------|------|------|
| Redpanda Cloud ⭐ | Free Serverless tier | Kafka-compatible, no Zookeeper, fast | Newer ecosystem |
| Confluent Cloud | $400 credit for 30 days | Industry standard, great docs | Credit expires |
| Self-hosted (Strimzi) | Free (just compute) | Full control, learning experience | More complex setup |

**For Local Development (Minikube):**
- **Redpanda (Docker) ⭐** - Easy: Single binary, no Zookeeper
- **Bitnami Kafka Helm** - Medium: Kubernetes-native
- **Strimzi Operator** - Medium-Hard: Production-grade K8s operator

#### Dapr Integration

**What is Dapr?**
Dapr (Distributed Application Runtime) is a portable, event-driven runtime that simplifies building microservices.

**Dapr Building Blocks for Todo App:**

| Building Block | Use Case |
|----------------|----------|
| Pub/Sub | Kafka abstraction – publish/subscribe without Kafka client code |
| State Management | Conversation state storage |
| Service Invocation | Frontend → Backend communication with retries |
| Bindings | Cron triggers for scheduled reminders |
| Secrets Management | Store API keys, DB credentials securely |

**Why Use Dapr?**

| Without Dapr | With Dapr |
|--------------|-----------|
| Import Kafka, Redis, Postgres libraries | Single HTTP API for all |
| Connection strings in code | Dapr components (YAML config) |
| Manual retry logic | Built-in retries, circuit breakers |
| Service URLs hardcoded | Automatic service discovery |
| Secrets in env vars | Secure secret store integration |
| Vendor lock-in | Swap components with config change |

---

## Technical Guides

### The Agentic Dev Stack

**AGENTS.md + Spec-KitPlus + Claude Code**

This powerful integration combines:
- **AGENTS.md** (The Constitution): Defines how agents should behave
- **Spec-KitPlus** (The Architect): Manages spec artifacts
- **Claude Code** (The Executor): Reads project memory and executes

**Workflow:**
1. Initialize: `specifyplus init <project_name>`
2. Create AGENTS.md with project rules
3. Wire Spec-KitPlus into Claude via MCP
4. Use CLAUDE.md as a "shim" pointing to AGENTS.md
5. Day-to-day: `Specify → Plan → Tasks → Implement`

### Spec-Kit Workflow (Source of Truth)

1. **Constitution (WHY)** - Principles & Constraints
2. **Specify (WHAT)** - Requirements & Acceptance Criteria
3. **Plan (HOW)** - Architecture & Components
4. **Tasks (BREAKDOWN)** - Atomic, Testable Work Units
5. **Implement (CODE)** - Write Only What Tasks Authorize

**Golden Rule:** No task = No code.

---

## Resources

### Core Tools

| Tool | Link | Description |
|------|------|-------------|
| Claude Code | claude.com/product/claude-code | AI coding assistant |
| GitHub Spec-Kit | github.com/panaversity/spec-kit-plus | Specification management |
| OpenAI ChatKit | platform.openai.com/docs/guides/chatkit | Chatbot UI framework |
| MCP | github.com/modelcontextprotocol/python-sdk | MCP server framework |

### Infrastructure

| Service | Link | Notes |
|---------|------|-------|
| Neon DB | neon.tech | Free tier available |
| Vercel | vercel.com | Free frontend hosting |
| DigitalOcean | digitalocean.com | $200 credit for 60 days |
| Minikube | minikube.sigs.k8s.io | Local Kubernetes |

---

## FAQ

**Q: Can I skip phases?**
A: No, each phase builds on the previous. You must complete them in order.

**Q: Can I use different technologies?**
A: The core stack must remain as specified. You can add additional tools/libraries.

**Q: Do I need a DigitalOcean account from the start?**
A: No, only for Phase V. Use the $200 free credit for new accounts.

**Q: Can I work in a team?**
A: This is an individual hackathon. Each participant submits separately.

**Q: What if I don't complete all phases?**
A: Submit what you complete. Partial submissions are evaluated proportionally.

---

## Submission Requirements

### Required Submissions

1. **Public GitHub Repository:**
   - All source code for all completed phases
   - `/specs` folder with all specification files
   - CLAUDE.md with Claude Code instructions
   - README.md with comprehensive documentation
   - Clear folder structure for each phase

2. **Deployed Application Links:**
   - Phase II: Vercel/frontend URL + Backend API URL
   - Phase III-V: Chatbot URL
   - Phase IV: Instructions for local Minikube setup
   - Phase V: Cloud deployment URL

3. **Demo Video (max 90 seconds):**
   - Demonstrate all implemented features
   - Show spec-driven development workflow
   - Judges will only watch the first 90 seconds

4. **WhatsApp Number** for presentation invitation

---

**Good luck, and may your specs be clear and your code be clean! 🚀**

— The Panaversity, PIAIC, and GIAIC Teams
