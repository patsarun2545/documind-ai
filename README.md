# DocuMind 🤖

AI-powered document chat application built with Next.js, featuring RAG pipeline with Gemini AI and PostgreSQL with pgvector for semantic search.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 |
| Frontend | React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Next.js API Routes |
| Runtime | Node.js |
| Database | PostgreSQL 16 with pgvector |
| Auth | JWT (jose), bcryptjs |
| Storage | Local filesystem (public/uploads) |
| Validation | Zod |
| Caching | None (in-memory rate limiting only) |
| UI Extras | Lucide React icons, Sonner (toasts) |
| Tools | Prisma ORM, Jest, Docker, GitHub Actions |

## ✨ Features Overview

- **User Authentication** — Login/register with JWT-based session cookies (7-day expiration)
- **Document Upload** — Support for PDF, DOCX, and TXT files up to 10MB
- **Document Processing** — Automatic parsing, chunking (500 words with 50 overlap), and vector embedding
- **Vector Search** — Semantic similarity search using pgvector cosine distance
- **AI Chat** — Streaming responses from Gemini 3.1 Flash Lite with source attribution
- **Chat Sessions** — Per-document conversation history with message persistence
- **Rate Limiting** — In-memory rate limiting (auth: 10 req/15min, api: 60 req/1min)
- **Document Status Tracking** — PROCESSING → READY/FAILED with automatic recovery
- **User Isolation** — All data scoped by userId for multi-tenant security
- **Stuck Document Recovery** — Auto-recovery for documents stuck in PROCESSING >10 minutes

## 📁 Project Structure

```
app/
├── (auth)/                    # Authentication routes
│   ├── login/
│   ├── register/
│   └── layout.tsx            # Auth layout wrapper
├── (dashboard)/              # Protected dashboard routes
│   ├── chat/
│   │   └── [documentId]/     # Document-specific chat interface
│   ├── layout.tsx            # Dashboard layout
│   ├── loading.tsx           # Loading state
│   └── page.tsx              # Dashboard home
├── api/                      # API endpoints
│   ├── auth/                 # Login, register, logout, me
│   │   ├── login/
│   │   ├── logout/
│   │   ├── me/
│   │   └── register/
│   ├── chat/                 # Chat sessions and messages
│   │   └── sessions/
│   │       ├── [id]/
│   │       │   └── messages/
│   │       └── route.ts
│   └── documents/            # Document upload, status, deletion
│       ├── [id]/
│       │   ├── route.ts
│       │   └── status/
│       │       └── route.ts
│       ├── process/          # (empty, reserved for future use)
│       └── route.ts
├── layout.tsx                # Root layout
└── globals.css               # Global styles

components/
├── ui/                       # shadcn/ui components (button, card, badge, etc.)
└── upload/
    └── UploadZone.tsx        # File upload component

lib/
├── auth.ts                   # JWT signing/verification, password hashing
├── chunking.ts               # Text chunking logic (500w/50 overlap)
├── db.ts                     # Prisma client singleton
├── documentConfig.ts         # File type validation, size limits
├── documentParser.ts         # PDF/DOCX/TXT parsing
├── embedding.ts              # Gemini embedding with retry logic
├── env.ts                    # Environment variable validation with Zod
├── gemini.ts                 # Gemini AI client configuration
├── rag.ts                    # RAG pipeline: embed, search, prompt building
├── rateLimit.ts              # In-memory rate limiting
├── startup.ts                # Stuck document recovery
└── utils.ts                  # Utility functions

prisma/
├── schema.prisma             # Database schema
├── migrations/               # Database migrations
└── seed.ts                   # Database seeding

types/
└── index.ts                  # TypeScript type definitions

__tests__/                    # Jest test files
public/uploads/               # Uploaded document storage
```

## 🗃️ Database Schema

| Model | Description |
|-------|-------------|
| **User** | Authentication data with email, password hash, name, and relationships to documents and chat sessions |
| **Document** | Uploaded file metadata (title, fileName, fileSize, fileType) with status (PROCESSING/READY/FAILED) and user ownership |
| **DocumentChunk** | Text chunks with vector embeddings (3072-dim) for semantic search, indexed by documentId |
| **ChatSession** | Conversation context linking a user to a document with title and message history |
| **ChatMessage** | Individual messages (USER/ASSISTANT) with content, optional source references (chunkIndex, content preview), and timestamps |

## 🔄 System Flow

## 01 · Authentication

```
User → Register/Login → Validate (Zod) → Hash Password (bcrypt) → Sign JWT (7d) → Set Cookie → Redirect
```

- **Users can**: Register with email/password (min 8 chars, letters + numbers), login with credentials, logout
- **Middleware protects**: `/`, `/chat/*` routes require valid JWT; `/login`, `/register` redirect authenticated users

| Cookie | Options |
|--------|---------|
| token | httpOnly, secure (production), sameSite: lax, maxAge: 7 days |

## 02 · Document Upload & Processing

```
Upload → Validate (type/size) → Save File → Create Document (PROCESSING) → Parse → Chunk → Embed → Store Vectors → Update (READY)
```

- **Users can**: Upload PDF/DOCX/TXT (max 10MB), view document list, check processing status
- **System processes**: Asynchronous background processing with setImmediate, automatic stuck recovery (>10 min → FAILED)

| Status | Description |
|--------|-------------|
| PROCESSING | Document being parsed, chunked, and embedded |
| READY | Document ready for chat queries |
| FAILED | Processing error (auto-recovered if stuck >10 min) |

## 03 · Chat & RAG Pipeline

```
Create Session → Check Document Status → Embed Query → Vector Search (top-5) → Build Prompt → Stream Gemini Response → Save Message
```

- **Users can**: Create chat session per document, send questions (max 1000 chars), receive streaming AI responses with source attribution
- **System searches**: pgvector cosine similarity on DocumentChunk embeddings, returns top-5 relevant chunks

| Step | Technology |
|-------|------------|
| Embedding | Gemini embedding model (gemini-embedding-001) |
| Search | PostgreSQL pgvector cosine distance (`<=>`) |
| Generation | Gemini 3.1 Flash Lite (streaming) |
| Response Format | Server-Sent Events (SSE) |

## Caching Strategy

| Tag pattern | Scope | Revalidated on |
|-------------|-------|----------------|
| None | N/A | N/A (no caching implemented) |

Note: Rate limiting uses in-memory Map store that resets on cold start. For multi-instance production, use @upstash/ratelimit + Redis.

## 🔐 Security

- **Password Hashing** — bcrypt with salt rounds = 10
- **JWT Authentication** — HS256 algorithm, 7-day expiration, httpOnly cookies
- **Input Validation** — Zod schemas for all API inputs (email, password, file types, question length)
- **Rate Limiting** — In-memory rate limiting by IP (auth: 10/15min, api: 60/1min)
- **Authorization** — Middleware route protection, userId-based data isolation
- **Environment Validation** — Zod schema validation at startup (DATABASE_URL, JWT_SECRET min 32 chars, GEMINI_API_KEY)
- **SQL Injection Prevention** — Prisma ORM with parameterized queries
- **File Upload Security** — MIME type validation, file size limits (10MB), UUID-based filenames

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 with pgvector extension
- Gemini API key

### Installation

```bash
git clone <repository-url>
cd documind
npm install
```

### Environment Variables

Create `.env` from `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/documind?schema=public"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
GEMINI_API_KEY="your-gemini-api-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Database Setup

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### Docker Setup

```bash
cp .env.example .env  # Add GEMINI_API_KEY and JWT_SECRET
docker-compose up --build
docker-compose exec web npx prisma migrate deploy
docker-compose exec web npx prisma db seed
```

## 👤 Author

**Kob** — Full Stack Developer  
Stack: Next.js, TypeScript, PostgreSQL, AI Integration  
Email: [your-email]  
GitHub: [your-github]
