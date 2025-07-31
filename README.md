# AI-Powered Compliance Copilot

A SaaS platform that uses AI to help startups and small fintechs auto-generate compliance documentation (PCI-DSS, SOC2, GDPR) based on their stack and workflows.

## Project Structure

```
├── frontend/          # React + TypeScript + Vite frontend
├── backend/           # NestJS + TypeScript backend (coming soon)
└── README.md
```

## Frontend

The frontend is built with:

- **React + TypeScript + Vite** for fast development
- **Tailwind CSS + shadcn/ui** for modern UI components
- **Compliance tracking** with progress visualization
- **Document management** with team collaboration
- **Real-time features** ready for WebSocket integration

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Backend

The backend is built with:

- **NestJS + TypeScript** for robust, scalable API
- **PostgreSQL + TypeORM** for data persistence
- **JWT Authentication** with role-based access control
- **Swagger API Documentation** for easy testing
- **WebSocket support** for real-time collaboration
- **AI Integration** ready for OpenAI/Claude APIs

### Backend Development

```bash
cd backend
npm install

# Setup database (PostgreSQL required)
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run start:dev
```

### API Documentation

Once the backend is running, visit: `http://localhost:3000/api/docs`

## Spec Document for this Project

1. AI-Powered Compliance Copilot
   Description:
   A SaaS platform that uses AI to help startups and small fintechs auto-generate compliance documentation (PCI-DSS, SOC2, GDPR) based on their stack and workflows.

🛠 Real-world use case:
Compliance is complex and expensive — early-stage teams spend hours on paperwork or hire consultants. This tool streamlines the process with AI-guided workflows and template generation.

💻 Tech Stack:

Frontend: React + TypeScript + Tailwind

Backend: Python (FastAPI), PostgreSQL, OpenAI API or Claude API for LLM features

Infrastructure: Docker, AWS (S3 for storage, Lambda for background processing)

Security: JWT auth, RBAC, encrypted storage, audit logs

Bonus: Redis + Celery for task queues

🧠 Enhanced features (Technical Depth):

AI-driven compliance checklist & document generation

Real-time collaboration on compliance templates (like Google Docs)

WebSocket-based comment threads for team discussion

Versioning of compliance docs with diff viewer

Optional PDF/Markdown export with digital signatures

💼 How to pitch it on your resume:

“Built an AI-powered SaaS compliance assistant for fintech startups, enabling automated PCI/SOC2 documentation generation with real-time team collaboration and audit trails. Integrated OpenAI LLMs, nest js backend, WebSocket-based real-time editing, and secure AWS cloud deployment.”
