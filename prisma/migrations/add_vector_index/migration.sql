-- รัน migration นี้หลัง deploy และมีข้อมูลอย่างน้อย 100 rows
CREATE INDEX IF NOT EXISTS document_chunk_embedding_idx
ON "DocumentChunk"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
