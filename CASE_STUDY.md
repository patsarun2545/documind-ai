# Building DocuMind: A RAG-Powered Document Chat System

## Problem Statement

Large Language Models (LLMs) have transformed how we interact with information, but they suffer from two critical limitations: knowledge cutoffs and inability to access private data. When you upload a proprietary document to ChatGPT, you're essentially trusting a third party with sensitive information. DocuMind addresses this by implementing Retrieval-Augmented Generation (RAG) entirely on your own infrastructure, ensuring your documents never leave your control while still enabling AI-powered conversations.

## Architecture: Two-Phase RAG Pipeline

DocuMind employs a classic RAG architecture split into indexing and querying phases:

```
Indexing Phase:
Document Upload → Parse (PDF/DOCX/TXT) → Chunk (500 words, 50 overlap) 
→ Embed (768d via Gemini) → Store in pgvector

Querying Phase:
User Question → Embed → Cosine Similarity Search (top 5) 
→ Build Prompt with Context → Gemini 2.0 Flash → SSE Stream Response
```

The system uses PostgreSQL with the pgvector extension for vector storage, enabling efficient cosine similarity searches without requiring external vector databases.

## Technical Decisions

**Framework Choice: Next.js API Routes vs Express**
We chose Next.js API Routes over Express for several reasons. The unified codebase with frontend and backend in one repository simplified development and deployment. Next.js's built-in API routes handle middleware, authentication, and routing elegantly. The edge runtime support for future scaling was also a consideration, though we currently use the Node.js runtime for pgvector compatibility.

**AI Provider: Gemini vs OpenAI**
Gemini emerged as the clear choice for three reasons: the free tier with generous rate limits, high-quality 768-dimensional embeddings (text-embedding-004), and the excellent Gemini 2.0 Flash model for chat. The 768d embeddings provide a good balance between accuracy and storage efficiency compared to larger alternatives.

**Vector Database: pgvector vs Pinecone**
While Pinecone offers managed vector search, pgvector keeps everything self-hosted. For a document chat system where documents are uploaded and processed once, then queried frequently, the read-heavy pattern suits PostgreSQL well. The pgvector extension provides sufficient performance for our use case without adding infrastructure complexity.

**Chunking Strategy: 500 Words with 50 Overlap**
After experimentation, we settled on 500-word chunks with 50-word overlaps. Smaller chunks increased context fragmentation and retrieval noise, while larger chunks reduced precision. The 50-word overlap ensures no information is lost at chunk boundaries, maintaining semantic continuity. This trade-off between chunk size and retrieval quality is application-specific and required testing with actual documents.

**Resilience: Retry with Exponential Backoff**
The embedding API occasionally fails due to rate limits or network issues. We implemented exponential backoff retry logic (1s, 2s, 4s delays) to handle transient failures gracefully. This ensures document processing completes reliably without manual intervention.

**Rate Limiting: In-Memory with Redis Path Forward**
For the initial implementation, we used in-memory rate limiting with a sliding window algorithm. This works well for single-instance deployments. We documented that Redis should replace this for horizontal scaling, as in-memory limits don't share state across instances.

## Challenges and Solutions

**SSE with POST Requests**
Browser EventSource doesn't support POST requests, which we needed for authentication and request bodies. We solved this by using the Fetch API with `response.body.getReader()`, manually parsing Server-Sent Events, and buffering incomplete lines to handle chunk boundaries. This approach maintains streaming capabilities while supporting POST.

**Prisma Vector Limitations**
Prisma ORM doesn't natively support vector types. We worked around this by using raw SQL with `prisma.$executeRaw` for vector insertions and similarity searches. This required careful SQL construction but provided the necessary flexibility.

**pgvector Extension Setup**
The pgvector extension must be created before use. We added a Prisma migration to run `CREATE EXTENSION vector;` ensuring the extension is available in all environments. This is a one-time setup but critical for the system to function.

**Polling Race Conditions**
During document processing, we poll for status updates. Multiple simultaneous uploads could create race conditions. We solved this using a `Map<string, NodeJS.Timeout>` to track active polling intervals per document, preventing duplicate timers for the same document.

**Server Restart Recovery**
If the server restarts during document processing, documents remain stuck in PROCESSING status. We implemented an auto-recovery mechanism that runs on startup, updating any PROCESSING documents older than 10 minutes to FAILED status. This prevents orphaned documents from blocking the system.

## Results and Lessons Learned

DocuMind successfully demonstrates that RAG can be implemented with a modern stack without sacrificing functionality. The system processes documents reliably, provides fast semantic search, and delivers streaming AI responses. Key lessons include the importance of graceful degradation (auto-recovery), the value of self-hosted solutions for data privacy, and that modern frameworks like Next.js can handle complex backend logic without needing separate Express servers.

## Tech Stack

| Component | Technology |
|-----------|-------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16 + pgvector |
| ORM | Prisma |
| AI | Gemini 2.0 Flash + text-embedding-004 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Auth | JWT + bcrypt |
| Rate Limiting | In-memory sliding window |
| Testing | Jest |
| Deployment | Docker, GitHub Actions, Vercel |
