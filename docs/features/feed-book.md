Perfect 👍 Since you're building your own UI, here is a **clean backend + model pipeline** to power it.

We’ll build a **local book-search API server** using:

* **Node.js** → Backend
* **Ollama** → LLM + embeddings
* **Chroma** → Semantic search database

Everything runs **offline**.

---

# 🧠 System Flow

```text
User Uploads Book
      ↓
Backend extracts text
      ↓
Split into chunks
      ↓
Create embeddings (Ollama)
      ↓
Store vectors (ChromaDB)
      ↓
User asks question
      ↓
Search similar chunks
      ↓
Send context to Ollama
      ↓
Answer returned to UI
```

---

# ⚙️ STEP 1 — Install & Start Models

### 1️⃣ Install **Ollama**

Download → [https://ollama.com](https://ollama.com)

### 2️⃣ Pull Required Models

```bash
ollama pull llama3
ollama pull nomic-embed-text
```

• `llama3` → answers questions
• `nomic-embed-text` → converts text → vectors

### 3️⃣ Start Ollama Server (if not auto)

```bash
ollama serve
```

Runs at:

```text
http://localhost:11434
```

Optional (if Ollama runs on a different host):

```bash
export OLLAMA_BASE_URL="http://localhost:11434"
```

---

# 🗄 STEP 2 — Start Vector Database

We’ll use ChromaDB locally.

### Option A — Docker (easy)

```bash
docker run -p 3003:8000 chromadb/chroma
```

Runs at:

```text
http://localhost:8000
```

---

# 📦 STEP 3 — Backend Dependencies

```bash
npm init -y
npm install express multer pdf-parse axios chromadb uuid
```

---

# 🧱 STEP 4 — Backend Folder Structure

```text
backend/
 ├── server.js
 ├── services/
 │     ├── extractText.js
 │     ├── chunkText.js
 │     ├── embed.js
 │     ├── vectorStore.js
 │     └── askModel.js
 └── uploads/
```

---

# 📄 STEP 5 — Core Service Logic

## ✂️ Text Chunking

```js
// services/chunkText.js
module.exports = function chunkText(text, size = 1000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size)
    chunks.push(text.slice(i, i + size));
  return chunks;
};
```

---

## 🧠 Embeddings via Ollama

```js
// services/embed.js
const axios = require("axios");

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

module.exports = async function embed(text) {
  const res = await axios.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
    model: "nomic-embed-text",
    prompt: text,
  });
  return res.data.embedding;
};
```

---

## 🗄 Store & Search Vectors

```js
// services/vectorStore.js
const { ChromaClient } = require("chromadb");
const client = new ChromaClient({ path: "http://localhost:8000" });

async function getCollection() {
  return client.getOrCreateCollection({ name: "books" });
}

exports.addDocs = async (ids, docs, embeddings) => {
  const col = await getCollection();
  await col.add({ ids, documents: docs, embeddings });
};

exports.searchDocs = async (embedding) => {
  const col = await getCollection();
  const res = await col.query({ queryEmbeddings: [embedding], nResults: 5 });
  return res.documents[0];
};
```

---

## 🤖 Ask LLM

```js
// services/askModel.js
const axios = require("axios");

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

module.exports = async function askModel(context, question) {
  const prompt = `
Answer using the context below.

${context.join("\n")}

Question: ${question}
`;

  const res = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
    model: "llama3",
    prompt,
    stream: false,
  });

  return res.data.response;
};
```

---

# 🚀 STEP 6 — Main Backend Server

```js
// server.js
const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");
const { v4: uuidv4 } = require("uuid");

const chunkText = require("./services/chunkText");
const embed = require("./services/embed");
const { addDocs, searchDocs } = require("./services/vectorStore");
const askModel = require("./services/askModel");

const upload = multer({ dest: "uploads/" });
const app = express();
app.use(express.json());

/* 📚 Upload & Index Book */
app.post("/upload", upload.single("book"), async (req, res) => {
  const fs = require("fs");
  const dataBuffer = fs.readFileSync(req.file.path);
  const data = await pdf(dataBuffer);

  const chunks = chunkText(data.text);
  const embeddings = [];

  for (const chunk of chunks) embeddings.push(await embed(chunk));

  const ids = chunks.map(() => uuidv4());
  await addDocs(ids, chunks, embeddings);

  res.json({ message: "Book indexed successfully" });
});

/* 🔍 Ask Question */
app.post("/ask", async (req, res) => {
  const { question } = req.body;
  const queryEmbedding = await embed(question);
  const docs = await searchDocs(queryEmbedding);
  const answer = await askModel(docs, question);
  res.json({ answer });
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

---

# 🔌 STEP 7 — API Usage (Your UI will call)

### 📚 Upload Book

```http
POST /upload
FormData: book = PDF file
```

---

# 🧑‍💼 Org Admin Upload (PDF)

Org admins can upload ebook PDFs into the platform backend. This stores the file and metadata for later indexing.

### ✅ Endpoint

```http
POST /api/org-admin/ebooks
FormData:
  ebook = PDF file
  subject = (required)
  board = (required)
  classLevel = (required)
  title = (optional)
  author = (optional)
  isbn = (optional)
  description = (optional)
```

### ✅ Response

```json
{
  "message": "Ebook uploaded",
  "ebook": {
    "id": "uuid",
    "subject": "Mathematics",
    "board": "CBSE",
    "classLevel": "10",
    "title": "Clean Architecture",
    "originalName": "clean-architecture.pdf",
    "size": 1234567,
    "storagePath": "uploads/ebooks/<orgId>/<uuid>.pdf"
  }
}
```

### ❓ Ask Question

```http
POST /ask
{
  "question": "Explain polymorphism"
}
```

---

# 🎯 Model Responsibilities

| Task              | Model            |
| ----------------- | ---------------- |
| Text → Vector     | nomic-embed-text |
| Answer Generation | llama3           |

---

# ✅ You Now Have

✔ Fully offline system
✔ Multi-book search
✔ Fast semantic search
✔ Your own UI control
✔ Private knowledge base
