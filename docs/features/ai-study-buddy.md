Perfect choice 🙌
An **AI Study Buddy** is impactful, scalable, and aligns well with your PrepKarta learning platform vision.

Below is your **step-by-step execution roadmap** from idea → real product 🚀

---

# 🎓 AI Study Buddy for Students — Complete Roadmap

---

## 🧭 PHASE 1 — Define Mission & Scope (Week 1)

### 🎯 Target Users

* Government school students
* Classes 6–12
* Hindi + simple English learners
* Low-cost Android devices

### 🎯 Core Mission

> “A free AI tutor that explains any topic simply and helps students revise faster.”

### ✅ MVP Features

1. Ask doubts in simple language
2. Chapter summaries
3. Auto quiz generator
4. Weak topic detection
5. Hindi explanation mode
6. Voice explanation (for difficult topics)

---

## 📚 PHASE 2 — Collect Free Education Data (Week 1–2)

### 📖 Primary Sources

* **NCERT** — Free textbooks (Classes 1–12)
* **DIKSHA Platform** — Govt digital lessons
* **Khan Academy** — Free concept videos
* Previous Year Question Papers (State Boards)

### 📂 What to Extract

* Chapters
* Definitions
* Important formulas
* Exercises & solutions
* Diagrams
* Example problems

### 🛠 Tools for Extraction

* PDF → Text: `PyMuPDF`
* OCR for Hindi: `Tesseract`
* Text Cleaning: Python NLP libraries

---

## 🧠 PHASE 3 — AI Capabilities to Build (Week 3–6)

### 1️⃣ Doubt Solver AI

Student types:

> "Explain photosynthesis simply"

AI gives:

* Simple explanation
* Example
* Key points
* Diagram description

**Tech**

* LLM APIs (OpenAI / open-source LLM)
* Prompt templates for school level

---

### 2️⃣ Smart Chapter Summary Generator

Upload chapter → AI generates:

* Short summary
* Bullet notes
* Key formulas
* Important questions

---

### 3️⃣ Quiz & Test Generator

AI creates:

* MCQs
* Fill in blanks
* Short answers
* Difficulty levels

Helps in exam prep 📈

---

### 4️⃣ Weak Area Detection

Tracks:

* Wrong answers
* Time taken per topic
* Retry patterns

AI suggests:

> "Revise Fractions again"

---

### 5️⃣ Hindi + Voice Tutor

Students can:

* Listen to explanations
* Ask doubts by speaking

**Tech**

* Speech-to-Text
* Text-to-Speech
* Hindi language LLM prompts

---

## 🏗️ PHASE 4 — System Architecture

```
Mobile App / Web App
        ↓
Backend API (Node.js / FastAPI)
        ↓
AI Layer
   • LLM for explanations
   • Quiz generator
   • Student performance analyzer
        ↓
Vector Database
   • Store textbook content
   • Fast semantic search
```

### ⚙️ Recommended Stack (Fast & Affordable)

| Layer     | Tech                           |
| --------- | ------------------------------ |
| Frontend  | Next.js / Flutter              |
| Backend   | Node.js (you already use JS)   |
| AI        | OpenAI API or Ollama local LLM |
| Vector DB | ChromaDB                       |
| Storage   | Firebase / Supabase            |

---

## 📱 PHASE 5 — Student Experience Flow

1️⃣ Select Class
2️⃣ Select Subject
3️⃣ Choose Chapter
4️⃣ Options:

* 📖 Learn Concept
* ❓ Ask Doubt
* 📝 Take Quiz
* 📊 See Progress
* 🎧 Listen in Hindi

---

## 🎨 PHASE 6 — Make Learning Fun

Add:

* 🏆 XP points
* 🎖️ Badges
* 🔥 Daily streaks
* 🧩 Concept games
* 📊 Progress tree

Makes students addicted to learning (good addiction 😄)

---

## 🌍 PHASE 7 — Social Impact Expansion

### Partner With

* NGOs teaching underprivileged kids
* Government schools
* Rural education missions

### Apply for Grants

* Google AI for Social Good
* Microsoft AI for Accessibility
* UNICEF Innovation Fund
* Indian Govt Digital Education Grants

---

## 🚀 PHASE 8 — Advanced AI (Future Upgrades)

* 📷 Homework scanner → solution generator
* 🧠 Personalized study plans
* 🎥 AI video explanations
* 👨‍🏫 Teacher dashboard
* 📴 Offline village mode
* 🗣️ Regional languages

---

# ⏳ Suggested Timeline

| Month   | Goal                            |
| ------- | ------------------------------- |
| Month 1 | MVP (Doubt solver + summaries)  |
| Month 2 | Quiz engine + progress tracking |
| Month 3 | Hindi voice tutor               |
| Month 4 | Mobile app launch               |
| Month 5 | NGO partnerships                |
| Month 6 | Government pilot program        |

---

# 💡 Why This Project is Powerful For YOU

✅ Matches PrepKarta vision
✅ Strong MBA strategic project
✅ Useful for research papers
✅ Attractive for global fellowships
✅ Massive social impact in India
✅ Can scale to millions of students


Perfect 👌
We’ll build your **AI Study Buddy** step-by-step like a real product.

Today → **STEP 1: Exact Database Schema**
(We’ll do the next items one-by-one in future messages.)

This schema is designed for:

✅ Student progress tracking
✅ Quiz system
✅ AI doubt solving
✅ Chapter learning
✅ Weak-area detection
✅ Scalable for millions of students

---

# 🗄️ Database Schema (System Design)

You can use **PostgreSQL / MySQL / Supabase**.

---

## 👤 1. Users Table

Stores student accounts.

```sql
users
-----
id (PK)
name
email
password_hash
class_level
preferred_language
created_at
```

---

## 📚 2. Subjects Table

```sql
subjects
--------
id (PK)
name
class_level
```

---

## 📖 3. Chapters Table

```sql
chapters
--------
id (PK)
subject_id (FK)
title
chapter_number
summary
```

---

## 📝 4. Topics Table

Fine-grained breakdown for better AI learning.

```sql
topics
------
id (PK)
chapter_id (FK)
title
content
difficulty_level
```

---

## ❓ 5. Doubts Table

Stores student questions for AI improvement.

```sql
doubts
------
id (PK)
user_id (FK)
topic_id (FK)
question_text
ai_answer
created_at
```

---

## 🧪 6. Quizzes Table

```sql
quizzes
-------
id (PK)
chapter_id (FK)
title
difficulty_level
created_at
```

---

## 📋 7. Questions Table

```sql
questions
---------
id (PK)
quiz_id (FK)
question_text
question_type (MCQ / SHORT / FILL)
option_a
option_b
option_c
option_d
correct_answer
explanation
```

---

## 📊 8. Quiz Attempts Table

Tracks performance.

```sql
quiz_attempts
-------------
id (PK)
quiz_id (FK)
user_id (FK)
score
time_taken_seconds
attempted_at
```

---

## ✅ 9. Question Attempts Table

```sql
question_attempts
-----------------
id (PK)
attempt_id (FK)
question_id (FK)
selected_answer
is_correct
```

---

## 📈 10. Progress Tracking Table

```sql
progress
--------
id (PK)
user_id (FK)
topic_id (FK)
mastery_level (0-100)
last_revised_at
revision_count
```

---

## 🧠 11. AI Interaction Logs (Improves Model Later)

```sql
ai_logs
-------
id (PK)
user_id (FK)
interaction_type (DOUBT / SUMMARY / QUIZ_GEN)
input_text
output_text
response_time_ms
created_at
```

---

# 🔗 Relationships Overview

```
User → Attempts Quizzes → Attempts Questions
User → Asks Doubts → AI Answers
User → Learns Topics → Progress Updates

Subjects → Chapters → Topics → Quizzes → Questions
```

---

# ⚡ Optional (Future Scaling Tables)

### 🏆 Achievements

Badges & gamification

### 👨‍🏫 Teachers

Teacher dashboards

### 🏫 Schools

School-level analytics

---

# 🎯 Why This Schema is Powerful

✅ Tracks learning deeply
✅ Detects weak topics
✅ Supports AI personalization
✅ Enables performance analytics
✅ Ready for gamification
✅ Scales to millions of users

---

## ✅ STEP 1 COMPLETE

Next step will be:

> **STEP 2: LLM Prompt Templates**

Perfect 👌
Let’s build the **brain** of your AI Study Buddy.

These are **ready-to-use LLM prompt templates** you can plug into OpenAI API or open-source LLMs.

They are designed for:

✅ School students
✅ Simple explanations
✅ Hindi support
✅ Quiz generation
✅ Personalized learning

---

# 🧠 STEP 2 — LLM Prompt Templates

---

## 🎓 1️⃣ Doubt Solver Prompt

**Use Case:** Student asks a question.

### 📥 Template

```text
You are a friendly AI tutor for school students.

Explain the following question in very simple language suitable for a Class {class_level} student.

Question: {student_question}

Instructions:
- Use simple words
- Keep explanation short and clear
- Give 1 real-life example
- Provide key points in bullets
- If useful, describe a simple diagram in words
- Do not use complex terminology
```

### 📤 Example Output

If student asks: *“What is photosynthesis?”*

AI gives:

* Simple definition
* Plant example
* Bullet key points
* Diagram description

---

## 📚 2️⃣ Chapter Summary Generator Prompt

**Use Case:** Student clicks “Summarize Chapter”

### 📥 Template

```text
You are an expert school teacher.

Create an easy revision summary for Class {class_level} students.

Chapter Title: {chapter_title}

Chapter Content:
{chapter_text}

Make the output in this format:

1. 📘 Short Summary (5-6 lines)
2. 🧠 Key Points (bullets)
3. 📌 Important Formulas / Definitions
4. 🎯 Very Important Exam Questions
5. 💡 Quick Revision Notes

Keep language simple and exam-focused.
```

---

## 📝 3️⃣ Quiz Generator Prompt

**Use Case:** Auto-generate tests

### 📥 Template

```text
You are an expert exam paper setter.

Generate a quiz for Class {class_level} students.

Topic: {topic_name}

Create:
- 5 MCQs
- 3 Fill in the blanks
- 2 Short answer questions

Rules:
- Keep difficulty: {easy/medium/hard}
- Questions must test concepts, not memorization
- Provide correct answers
- Provide short explanations
- Use simple language

Return in JSON format.
```

---

## 📊 4️⃣ Weak Area Detection Prompt

**Use Case:** Personalized improvement tips

### 📥 Template

```text
You are an AI learning analyst.

A student has completed quizzes. Analyze their weak areas.

Student Performance Data:
{performance_data_json}

Tasks:
1. Identify weak topics
2. Explain why student may be struggling
3. Suggest what to revise
4. Suggest practice question types
5. Motivate student positively

Keep tone supportive and encouraging.
```

---

## 🗣️ 5️⃣ Hindi Explanation Mode Prompt

**Use Case:** Student clicks “Explain in Hindi”

### 📥 Template

```text
You are a helpful AI tutor.

Explain the following topic in very simple Hindi suitable for school students.

Topic: {topic}

Rules:
- Use very easy Hindi
- Avoid difficult Sanskrit words
- Give daily life examples
- Keep explanation short
- Use bullet points
```

---

## 🎧 6️⃣ Voice Tutor Script Prompt

**Use Case:** Convert lesson to listening format

### 📥 Template

```text
You are a friendly school teacher creating an audio lesson.

Convert the topic into a voice-friendly explanation.

Topic: {topic}

Rules:
- Speak like a teacher teaching slowly
- Use short sentences
- Ask 2 thinking questions in between
- Give examples students relate to
- End with quick revision points
```

---

## 🧩 7️⃣ Homework Helper Prompt

**Use Case:** Student uploads homework question

### 📥 Template

```text
You are a step-by-step homework helper for school students.

Solve the following problem step-by-step:

Question: {question}

Rules:
- Show each step clearly
- Explain why each step is done
- Highlight formulas used
- Give final answer clearly
- Add "Common Mistake" tip at end
```

---

## 🎯 8️⃣ Personalized Study Plan Prompt

```text
You are an AI academic planner.

Create a 7-day revision plan.

Student Details:
Class: {class}
Weak Topics: {weak_topics}
Exam Date: {exam_date}
Daily Study Time: {available_hours}

Make a balanced plan with:
- Topics per day
- Revision slots
- Practice tests
- Light days & heavy days
- Motivational tips
```

---

# ⚙️ Pro Tips for Better AI Responses

### ✅ Add Student Context

Always pass:

* Class level
* Language preference
* Weak topics
* Past mistakes

### ✅ Use “Simple Language” instruction

Improves clarity for kids.

### ✅ Limit Output Size

Prevents overload.

---

# ✅ STEP 2 COMPLETE

Next step:

> **STEP 3: NCERT Scraping Scripts**
 Great 👌
Now we’ll build your **content pipeline** — converting NCERT books into clean AI-ready text.

This step helps you create your **own free knowledge base** for the AI Study Buddy.

---

# 📚 STEP 3 — NCERT Scraping & Processing Scripts

We’ll do this in 4 parts:

1️⃣ Download NCERT PDFs
2️⃣ Extract text from PDFs
3️⃣ Split into chapters
4️⃣ Clean & store for AI search

---

## 🔹 1️⃣ Download NCERT Books (Manual + Script)

### 🌐 Official Source

Books are freely available from **NCERT** website.

You can either:

* Download manually
* Or automate using script

---

### 🤖 Python Script — Download PDF

```python
import requests

url = "https://ncert.nic.in/textbook/pdf/leph101.pdf"  # example book
response = requests.get(url)

with open("book.pdf", "wb") as f:
    f.write(response.content)

print("Downloaded successfully")
```

---

## 🔹 2️⃣ Extract Text from PDF

We’ll use **PyMuPDF** (fast & accurate).

### 📦 Install

```bash
pip install pymupdf
```

### 🤖 Script — PDF to Text

```python
import fitz  # PyMuPDF

doc = fitz.open("book.pdf")
full_text = ""

for page in doc:
    full_text += page.get_text()

with open("book.txt", "w", encoding="utf-8") as f:
    f.write(full_text)

print("Text extracted")
```

---

## 🔹 3️⃣ Split Book into Chapters

NCERT books usually contain headings like:

> Chapter 1
> Chapter 2
> CHAPTER 3

### 🤖 Script — Chapter Splitter

```python
import re

with open("book.txt", "r", encoding="utf-8") as f:
    text = f.read()

chapters = re.split(r'Chapter\s+\d+', text, flags=re.IGNORECASE)

for i, chapter in enumerate(chapters):
    with open(f"chapter_{i}.txt", "w", encoding="utf-8") as f:
        f.write(chapter)

print("Chapters separated")
```

---

## 🔹 4️⃣ Clean Extracted Text

PDF text is messy. We clean it for AI.

### 🤖 Script — Text Cleaner

```python
import re

def clean_text(text):
    text = re.sub(r'\n+', '\n', text)  # remove extra newlines
    text = re.sub(r'\s+', ' ', text)   # remove extra spaces
    text = re.sub(r'\d+\s*$', '', text)  # remove page numbers
    return text.strip()

with open("chapter_1.txt", "r", encoding="utf-8") as f:
    raw = f.read()

cleaned = clean_text(raw)

with open("chapter_1_clean.txt", "w", encoding="utf-8") as f:
    f.write(cleaned)

print("Cleaned successfully")
```

---

## 🔹 5️⃣ Convert to AI-Searchable Chunks

LLMs work best with small chunks.

### 🤖 Script — Chunking

```python
def chunk_text(text, chunk_size=500):
    chunks = []
    words = text.split()
    
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)
    
    return chunks

with open("chapter_1_clean.txt", "r", encoding="utf-8") as f:
    text = f.read()

chunks = chunk_text(text)

for i, chunk in enumerate(chunks):
    with open(f"chunks/chunk_{i}.txt", "w", encoding="utf-8") as f:
        f.write(chunk)

print("Chunks ready for AI search")
```

---

## 🔹 6️⃣ Store in Vector Database (for Semantic Search)

Best free option: **ChromaDB**

### 📦 Install

```bash
pip install chromadb
```

### 🤖 Script — Store Embeddings

```python
import chromadb
from chromadb.utils import embedding_functions

client = chromadb.Client()
collection = client.create_collection("ncert")

for i, chunk in enumerate(chunks):
    collection.add(
        documents=[chunk],
        ids=[f"id_{i}"]
    )

print("Stored in vector DB")
```

Now your AI can **search concepts like a smart teacher**.

---

# 🧠 Final Output Pipeline

```
NCERT PDF
   ↓
Text Extraction
   ↓
Chapter Split
   ↓
Cleaning
   ↓
Chunking
   ↓
Vector DB
   ↓
AI Doubt Solving
```

---

# ⚡ Optional (Better Quality)

| Problem           | Solution                 |
| ----------------- | ------------------------ |
| Hindi text issues | Use Tesseract OCR        |
| Scanned PDFs      | Use OCR extraction       |
| Diagrams missing  | Add manual diagram notes |
| Tables messy      | Clean via regex          |

---

# ✅ STEP 3 COMPLETE

Next step:

> 🎨 **STEP 4: UI Wireframe Design**
 
 Great progress 🚀
Now let’s decide what to build first so you don’t waste time or money.

This step turns your big vision into a **practical launch plan**.

---

# ✅ STEP 5 — MVP Feature Priority List

*(What to build first vs later)*

MVP = **Minimum Viable Product**
→ Smallest version that still helps students

---

## 🥇 PHASE 1 — CORE MVP (Must Have)

These features alone make your app useful.

### 1️⃣ Ask Doubt (AI Tutor Chat)

**Why first?**

* Main problem solver
* Students love instant answers
* High engagement

**Includes**
✔ Text question input
✔ AI simple explanation
✔ Bullet key points
✔ Hindi explanation toggle

---

### 2️⃣ Chapter Summary

**Why second?**

* Helps quick revision
* Easy to build (LLM-powered)

**Includes**
✔ Short summary
✔ Key points
✔ Important formulas
✔ Exam questions

---

### 3️⃣ Quiz Generator

**Why third?**

* Makes learning active
* Needed for progress tracking

**Includes**
✔ MCQs auto-generated
✔ Instant scoring
✔ Correct answer explanation

---

### 4️⃣ Progress Tracking

**Why important?**

* Students see improvement
* Enables weak-area detection

**Includes**
✔ Quiz history
✔ Accuracy %
✔ Topics completed

---

## 🥈 PHASE 2 — ENGAGEMENT FEATURES

### 5️⃣ Weak Area Detection

AI tells:

> “You need to revise Fractions again”

---

### 6️⃣ Gamification System

✔ XP points
✔ Badges
✔ Streaks
✔ Level system

Makes learning addictive 🎮

---

### 7️⃣ Hindi Voice Tutor

✔ Listen to explanations
✔ Great for rural students
✔ Accessibility boost

---

## 🥉 PHASE 3 — ADVANCED SMART FEATURES

### 8️⃣ Homework Scanner

📷 Photo → AI solution

---

### 9️⃣ Personalized Study Plans

AI creates daily schedules

---

### 🔟 Teacher / Parent Dashboard

Track student performance

---

# 🎯 Build Priority Timeline

| Stage   | Features                                 | Time      |
| ------- | ---------------------------------------- | --------- |
| Phase 1 | Doubt Solver + Summary + Quiz + Progress | 4–6 weeks |
| Phase 2 | Weak Areas + Gamification + Voice        | 3–4 weeks |
| Phase 3 | Scanner + Study Plans + Dashboard        | Later     |

---

# ⚡ If You Want FAST Launch (Best Strategy)

Start with ONLY:

✅ Ask Doubt
✅ Chapter Summary
✅ Quiz
✅ Progress

That’s enough to help thousands of students.

---

# 🧠 Smart Founder Tip

Most edtech apps fail because they:

❌ Add too many features
❌ Build for teachers first
❌ Ignore revision tools

You are building:

✔ Simple
✔ AI-powered
✔ Student-first
✔ Revision-focused

Perfect for real impact 💯

---

# ✅ STEP 5 COMPLETE

Next step:

> 💸 **STEP 6 — How to Run it FREE using Open-Source AI**

Perfect 👌
Now let’s make your **AI Study Buddy run at ₹0 cost** using open-source tools.

This is where your project becomes:

✅ Non-profit friendly
✅ Student scalable
✅ No API bills
✅ Fully under your control

---

# 💸 STEP 6 — Run FREE using Open-Source AI

We’ll replace paid services with free alternatives.

---

## 🧠 1️⃣ Free LLM (Brain of Your App)

Instead of paid APIs, use local open-source models via **Ollama**

### ✅ Best Free Models

| Model                     | Size        | Best For             |
| ------------------------- | ----------- | -------------------- |
| **Meta Llama 3 8B**       | Medium      | Best overall tutor   |
| **Mistral AI Mistral 7B** | Lightweight | Fast responses       |
| **Google Gemma 7B**       | Lightweight | Runs on low RAM      |
| Phi-3 Mini                | Very Small  | Very fast, basic Q&A |

---

### ⚙️ Install Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 📥 Download Model

```bash
ollama pull llama3
```

### ▶ Run Model

```bash
ollama run llama3
```

Now you have **ChatGPT-like AI running offline**.

---

## 🧠 2️⃣ Free Embeddings (for Smart Search)

Use:

**sentence-transformers** (open-source)

```bash
pip install sentence-transformers
```

Popular model:

```
all-MiniLM-L6-v2
```

✔ Converts textbook text into vectors
✔ Enables semantic search
✔ Runs locally

---

## 🗄️ 3️⃣ Free Vector Database

Use **Chroma** (already explored by you 👌)

### Why Chroma?

✅ Free
✅ Runs locally
✅ No cloud needed
✅ Perfect for RAG systems

---

## 🌐 4️⃣ Free Backend Hosting

### 🥇 Best Options

| Platform | Free? | Best For       |
| -------- | ----- | -------------- |
| Render   | ✅     | APIs           |
| Railway  | ✅     | Fullstack apps |
| Fly.io   | ✅     | Global apps    |
| Local PC | ✅     | Development    |

---

## 🖥️ 5️⃣ Run Everything on Your Laptop (Offline Mode)

You can run full system locally:

```
Student App
   ↓
Local Backend (Node.js)
   ↓
Ollama LLM
   ↓
ChromaDB
   ↓
NCERT Knowledge Base
```

No internet required 🌐❌

Perfect for:

* Rural schools
* NGOs
* Low connectivity regions

---

## 📦 6️⃣ Free Frontend Hosting

| Platform     | Use             |
| ------------ | --------------- |
| Vercel       | Next.js apps    |
| Netlify      | Static sites    |
| GitHub Pages | Simple web apps |

---

## 💾 7️⃣ Free Database Hosting

| Option             | Type          |
| ------------------ | ------------- |
| Supabase Free Tier | PostgreSQL    |
| Firebase Free Tier | NoSQL         |
| SQLite             | Local storage |

---

# 💰 Monthly Cost Comparison

| Setup                   | Cost             |
| ----------------------- | ---------------- |
| Using OpenAI APIs       | ₹15k–₹1L/month ❌ |
| Using Open-Source Stack | ₹0 ✅             |

---

# ⚡ Recommended FREE Stack for YOU

Since you already work with Node & system design:

| Layer      | Tool                  |
| ---------- | --------------------- |
| Frontend   | Next.js               |
| Backend    | Node.js               |
| LLM        | Ollama + Llama 3      |
| Vector DB  | ChromaDB              |
| Embeddings | sentence-transformers |
| Database   | Supabase Free         |
| Hosting    | Render / Vercel       |

---

# 🚀 Performance Tips (Important)

### If laptop has:

**8GB RAM** → Use Mistral 7B
**16GB RAM** → Use Llama 3 8B
**Low RAM** → Use Phi-3 Mini

---

# 🌍 How NGOs Can Use It FREE

You can distribute:

✅ Offline desktop version
✅ Android APK
✅ School server install
✅ Pen drive portable AI tutor

This makes it perfect for:

* Rural education
* Government schools
* CSR initiatives
* Digital India missions

---

# 🎯 You Now Have Complete Blueprint

You planned:

✅ Database
✅ AI Prompts
✅ Content Pipeline
✅ UI Design
✅ MVP Plan
✅ Free AI Infra

This is **startup-level system design** 👏

---
Perfect 👌
Now we design the **Backend APIs** — the bridge between your Student App and AI system.

This will be clean, scalable, and easy to build using **Node.js (Express/Fastify)**.

---

# ⚙️ Backend API Design — AI Study Buddy

## 🧱 Architecture Style

RESTful APIs
Base URL:

```
/api/v1/
```

---

# 👤 1️⃣ Authentication APIs

### 🔹 Register Student

```
POST /api/v1/auth/register
```

**Body**

```json
{
  "name": "Rahul",
  "email": "rahul@email.com",
  "password": "123456",
  "classLevel": 8,
  "preferredLanguage": "Hindi"
}
```

**Response**

```json
{
  "message": "User registered",
  "token": "jwt_token"
}
```

---

### 🔹 Login

```
POST /api/v1/auth/login
```

---

### 🔹 Get Profile

```
GET /api/v1/auth/me
```

---

# 📚 2️⃣ Subjects & Chapters APIs

### 🔹 Get Subjects by Class

```
GET /api/v1/subjects?class=8
```

---

### 🔹 Get Chapters by Subject

```
GET /api/v1/chapters?subjectId=12
```

---

### 🔹 Get Chapter Details

```
GET /api/v1/chapters/:chapterId
```

**Response includes**

* Summary
* Key points
* Topics list

---

# 🧠 3️⃣ AI Learning APIs

---

### 🔹 Ask Doubt (RAG Powered)

```
POST /api/v1/ai/doubt
```

**Body**

```json
{
  "question": "Explain photosynthesis",
  "classLevel": 7,
  "language": "Hindi"
}
```

**Backend Flow**

```
Receive Question
   ↓
Search Vector DB (Chroma)
   ↓
Send context + question to LLM (Ollama)
   ↓
Return simplified answer
```

**Response**

```json
{
  "answer": "Photosynthesis is...",
  "keyPoints": ["Point 1", "Point 2"],
  "diagramHint": "Draw a plant..."
}
```

---

### 🔹 Generate Chapter Summary

```
POST /api/v1/ai/summary
```

---

### 🔹 Generate Quiz

```
POST /api/v1/ai/quiz
```

**Body**

```json
{
  "chapterId": "123",
  "difficulty": "easy",
  "questionCount": 10
}
```

---

### 🔹 Weak Area Analysis

```
GET /api/v1/ai/weak-areas/:userId
```

---

# 📝 4️⃣ Quiz APIs

### 🔹 Start Quiz

```
POST /api/v1/quiz/start
```

---

### 🔹 Submit Quiz

```
POST /api/v1/quiz/submit
```

**Body**

```json
{
  "quizId": "quiz_123",
  "answers": [
    {"questionId": "q1", "answer": "A"},
    {"questionId": "q2", "answer": "B"}
  ],
  "timeTaken": 320
}
```

---

### 🔹 Get Quiz History

```
GET /api/v1/quiz/history/:userId
```

---

# 📊 5️⃣ Progress Tracking APIs

### 🔹 Get Student Progress

```
GET /api/v1/progress/:userId
```

---

### 🔹 Update Topic Mastery

```
POST /api/v1/progress/update
```

---

# 🎮 6️⃣ Gamification APIs

### 🔹 Get Rewards

```
GET /api/v1/rewards/:userId
```

### 🔹 Claim Badge

```
POST /api/v1/rewards/claim
```

---

# 🧠 Internal AI Service APIs (Backend → AI Engine)

These are private routes.

### 🔹 Vector Search

```
POST /internal/search
```

### 🔹 LLM Generation

```
POST /internal/generate
```

---

# 📦 Standard API Response Format

### ✅ Success

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

### ❌ Error

```json
{
  "success": false,
  "error": "Invalid chapter ID"
}
```

---

# 🔐 Security Layers

✅ JWT Authentication
✅ Rate limiting (avoid misuse)
✅ Input validation
✅ API logging
✅ Role-based access (student/teacher/admin)

---

# ⚡ Suggested Backend Folder Structure

```
src/
 ├── controllers/
 ├── routes/
 ├── services/
 │     ├── ai.service.js
 │     ├── quiz.service.js
 │     ├── progress.service.js
 ├── middleware/
 ├── models/
 ├── utils/
 └── app.js
```

---

# 🚀 Backend Request Flow Example

```
Student asks doubt
   ↓
Frontend sends API request
   ↓
Backend validates user
   ↓
AI Service gets context from ChromaDB
   ↓
LLM generates answer
   ↓
Backend formats response
   ↓
Student sees simple explanation
```

---

# 🎯 You Now Have

✅ Database Design
✅ Prompt Engineering
✅ Content Pipeline
✅ UI Blueprint
✅ MVP Plan
✅ Free AI Stack
✅ System Architecture
✅ Backend API Structure

You’ve basically designed a **full AI EdTech platform** 💯

---
Perfect 👌
Now we connect your backend with the **AI brain** 🧠
This is where your app becomes truly intelligent.

We’ll integrate:

✅ Ollama (LLM)
✅ ChromaDB (Vector Search)
✅ Embeddings
✅ RAG Pipeline

All using **Node.js backend**.

---

# 🤖 3️⃣ AI Service Integration Code

---

# 🧱 Overall Flow (RAG Pipeline)

```
Student Question
   ↓
Backend API
   ↓
Convert Question → Embedding
   ↓
Search ChromaDB (similar content)
   ↓
Send Context + Question → Ollama LLM
   ↓
Generate Simple Answer
   ↓
Return to Student
```

---

# 📦 Step 1 — Install Dependencies

```bash
npm install axios chromadb dotenv
```

If using embeddings via Python service, no need here.

---

# ⚙️ Step 2 — Environment Variables

Create `.env`

```
OLLAMA_URL=http://localhost:11434
CHROMA_URL=http://localhost:8000
MODEL_NAME=llama3
```

---

# 🧠 Step 3 — AI Service File

📁 `services/ai.service.js`

---

## 🔹 1. Ask Doubt with RAG

```javascript
import axios from "axios";
import { ChromaClient } from "chromadb";

const chroma = new ChromaClient({ path: process.env.CHROMA_URL });

export async function askDoubt(question) {
  try {
    // 1️⃣ Search vector DB
    const collection = await chroma.getCollection({ name: "ncert" });

    const results = await collection.query({
      queryTexts: [question],
      nResults: 3,
    });

    const context = results.documents.flat().join("\n");

    // 2️⃣ Send to Ollama LLM
    const prompt = `
You are a friendly AI tutor for school students.

Use the context below to answer simply.

Context:
${context}

Question:
${question}

Instructions:
- Use simple language
- Give bullet key points
- Give one example
`;

    const response = await axios.post(
      `${process.env.OLLAMA_URL}/api/generate`,
      {
        model: process.env.MODEL_NAME,
        prompt: prompt,
        stream: false,
      }
    );

    return response.data.response;

  } catch (error) {
    console.error(error);
    throw new Error("AI Service Error");
  }
}
```

---

## 🔹 2. Generate Quiz

```javascript
export async function generateQuiz(topic) {
  const prompt = `
Generate a quiz for school students.

Topic: ${topic}

Create:
- 5 MCQs
- Provide answers
- Simple language
- JSON format
`;

  const response = await axios.post(
    `${process.env.OLLAMA_URL}/api/generate`,
    {
      model: process.env.MODEL_NAME,
      prompt: prompt,
      stream: false,
    }
  );

  return response.data.response;
}
```

---

## 🔹 3. Generate Chapter Summary

```javascript
export async function generateSummary(chapterText) {
  const prompt = `
Summarize this chapter for revision.

${chapterText}

Provide:
- Short summary
- Key points
- Important formulas
`;

  const response = await axios.post(
    `${process.env.OLLAMA_URL}/api/generate`,
    {
      model: process.env.MODEL_NAME,
      prompt: prompt,
      stream: false,
    }
  );

  return response.data.response;
}
```

---

# 🔌 Step 4 — Connect API Route

📁 `routes/ai.routes.js`

```javascript
import express from "express";
import { askDoubt } from "../services/ai.service.js";

const router = express.Router();

router.post("/doubt", async (req, res) => {
  const { question } = req.body;

  const answer = await askDoubt(question);

  res.json({
    success: true,
    answer,
  });
});

export default router;
```

---

# 🧪 Step 5 — Test API

### Request

```
POST http://localhost:5000/api/v1/ai/doubt
```

```json
{
  "question": "Explain photosynthesis simply"
}
```

### Response

```json
{
  "success": true,
  "answer": "Photosynthesis is how plants make food..."
}
```

---

# ⚡ Performance Optimizations

### ✅ Limit context chunks

Top 3 matches enough

### ✅ Use smaller model if slow

Switch to:

```
MODEL_NAME=mistral
```

### ✅ Cache frequent questions

Store in Redis

---

# 🧠 Optional: Streaming Response (ChatGPT-like typing)

Set:

```json
"stream": true
```

---

# 🔒 Error Handling Wrapper

```javascript
export async function safeAICall(fn) {
  try {
    return await fn();
  } catch (e) {
    console.error("AI Error:", e.message);
    return "AI is busy. Please try again.";
  }
}
```

---

# 🎯 You Now Have Full AI Integration

Your backend can now:

✅ Answer student doubts
✅ Generate quizzes
✅ Create summaries
✅ Use NCERT knowledge
✅ Run fully offline
✅ Cost ₹0

---

Here’s a **high-quality AI image prompt** you can use in tools like Midjourney, DALL·E, Leonardo, or Figma AI to generate a similar webpage design 👇

---

## 🎨 Webpage UI Generation Prompt

**Prompt:**

> Design a modern educational landing webpage for an AI-powered student learning platform called “AI Study Buddy”.
>
> The design should be clean, friendly, and student-focused with soft blue and green color themes.
>
> 📌 Hero Section:
> • Large bold heading: “A Free AI Tutor for Every Student”
> • Subtext explaining it helps students from classes 6–12 with personalized AI learning
> • Green call-to-action button “Get Involved Today”
> • Right side illustration showing students using smartphones and an AI tutor screen explaining a science concept
>
> 📌 Features Overview Section:
> • Section title: “What is AI Study Buddy?”
> • Three feature cards in a row with soft shadows
> • Card 1: Smart AI Tutor (robot icon)
> • Card 2: Smart Chapter Summaries (mobile content icon)
> • Card 3: Auto Quiz Generator (quiz icon with India map background)
>
> 📌 Key Features Section:
> • Left side vertical feature list with icons
> • Features: Instant Doubt Solver, Smart Chapter Summaries, Auto Quiz Generator, Progress Tracking
> • Right side illustration of happy school students learning together
>
> 📌 Impact Section:
> • Title: “Bridging the Education Gap”
> • Checklist style bullet points
> • Focus on government school students, rural learners, economically disadvantaged students
>
> 📌 How It Works Section:
> • Step-by-step visual flow
> • Students using tablets and AI helping them
> • Mobile app interface mockup
>
> 📌 Footer CTA Section:
> • Green gradient background
> • Motivational line about equal education
> • Prominent button for participation
>
> 🎨 Style Guidelines:
> • Soft UI design
> • Rounded cards with light shadows
> • Flat vector illustrations
> • Friendly cartoon-style student characters
> • Clean spacing and modern typography
> • Startup landing page layout
> • Professional but warm and inspiring
>
> 📱 Perspective: Full website mockup, vertical scroll layout
> 💡 Quality: High-fidelity UI/UX design, Dribbble-style presentation

---
Here’s a professional **AI prompt** to generate a modern **Student Dashboard UI** for your AI Study Buddy platform 👇

---

## 🎨 Dashboard UI Generation Prompt

**Prompt:**

> Design a modern, clean, and student-friendly dashboard UI for an AI-powered learning platform called “AI Study Buddy”.
>
> The dashboard should feel motivating, simple, and gamified, designed for school students aged 11–18. Use soft blue, teal, and green color themes with rounded cards and friendly design.
>
> 📌 Top Navigation Bar:
> • Platform logo on left
> • Menu items: Dashboard, Subjects, Quiz, Progress, Rewards
> • Notification bell icon
> • Student profile avatar on right
>
> 📌 Welcome Header Section:
> • Greeting text: “Welcome back, Student!”
> • Subtext showing learning streak and motivational message
> • Small illustration of a happy student studying with AI on a tablet
>
> 📌 Quick Action Cards (4 cards in grid):
> • Ask AI Doubt (chat bubble icon)
> • Revise Chapter (book icon)
> • Start Quiz (quiz/check icon)
> • View Progress (analytics chart icon)
> • Cards should be colorful, rounded, with soft shadows
>
> 📌 Subjects Section:
> • Horizontal scroll cards for subjects like Science, Mathematics, English, Social Studies
> • Each card shows progress bar and completion percentage
> • Subject icons and soft pastel backgrounds
>
> 📌 Performance Overview Section:
> • Title: “Your Learning Progress”
> • Circular progress chart showing syllabus completion
> • Bar graph for recent quiz scores
> • Clean analytics-style visualization
>
> 📌 Weak Areas Section:
> • Highlight topics needing improvement
> • Tag-style UI elements
> • “Practice Now” buttons next to each weak topic
>
> 📌 Rewards & Gamification Section:
> • Badge icons earned by student
> • XP points counter
> • Daily learning streak indicator (fire icon)
> • Fun and game-like visual elements
>
> 📌 AI Assistant Widget:
> • Floating chat widget at bottom-right corner
> • Friendly AI robot avatar
> • Text: “Ask me any doubt!”
>
> 🎨 Style Guidelines:
> • Soft UI with rounded corners
> • Card-based layout
> • Light background with colorful sections
> • Flat vector illustrations
> • Friendly fonts and clear hierarchy
> • Modern EdTech startup design
> • Highly intuitive and distraction-free layout
>
> 📱 Layout: Web app dashboard, responsive design
> 💡 Quality: High-fidelity UI/UX, Dribbble-style professional mockup, clean spacing system

Great 🚀
Here’s a **Lovable.dev prompt** to generate a professional **Admin Panel** for your AI Study Buddy platform.

---

# 💜 Prompt for Lovable.dev — Admin Panel

**Prompt to paste into Lovable:**

> Build a modern, responsive **Admin Panel Web App** for an educational AI platform called **“AI Study Buddy”**.
>
> The admin panel is used by administrators, NGOs, school management, and program coordinators to monitor students, teachers, content, and system analytics.
>
> The design should look professional, clean, data-focused, and trustworthy with a blue, teal, and white color palette. Use a dashboard-style layout similar to modern SaaS analytics platforms.
>
> ---
>
> ### 🧭 Layout Structure
>
> * Left **sidebar navigation**
> * Top **header bar**
> * Main **analytics dashboard area**
> * Card-based modular layout
>
> ---
>
> ### 📌 Sidebar Navigation Menu
>
> Include icons and labels:
>
> * Dashboard Overview
> * Student Management
> * Teacher Management
> * School Management
> * Content Library
> * AI Usage Analytics
> * Quiz & Performance Reports
> * Rewards & Gamification
> * Announcements
> * Settings
>
> Sidebar should be collapsible.
>
> ---
>
> ### 📊 Dashboard Overview (Home Screen)
>
> Show analytics cards in a grid:
>
> * Total Students
> * Active Users Today
> * Total Schools Connected
> * AI Questions Asked Today
> * Quizzes Completed
> * Average Student Performance
>
> Include small trend indicators (up/down arrows).
>
> ---
>
> ### 📈 Analytics Section
>
> Include clean data visualizations:
>
> * Line chart → student activity over time
> * Bar chart → subject-wise performance
> * Pie chart → usage by class grade
> * Heatmap → peak study hours
>
> Charts should look modern and minimal.
>
> ---
>
> ### 👨‍🎓 Student Management Page
>
> * Searchable student table
> * Columns: Name, Class, School, Progress %, Weak Subjects, Last Active
> * “View Details” button
> * Filters for class and performance level
>
> ---
>
> ### 🏫 School Management Page
>
> * List of registered schools
> * Stats: student count, active usage, region
> * Map visualization of school locations
>
> ---
>
> ### 📚 Content Management
>
> * Upload study materials
> * Manage subjects & chapters
> * AI content approval system
> * Tag content by class and subject
>
> ---
>
> ### 🤖 AI Usage Monitoring
>
> * Total AI queries per day
> * Most asked subjects
> * Average response time
> * System performance status indicator
>
> ---
>
> ### 🏆 Rewards & Gamification Control
>
> * Configure points system
> * Badge management
> * Student leaderboard preview
>
> ---
>
> ### 🔔 Announcements Module
>
> * Create and send announcements
> * Target by class, school, or region
>
> ---
>
> ### ⚙️ Settings Page
>
> * Role management (Admin / NGO / School Head)
> * Language settings
> * System preferences
> * Data export options
>
> ---
>
> ### 🎨 UI Design Style
>
> * Professional SaaS admin dashboard
> * Clean typography
> * Card-based analytics layout
> * Soft shadows and rounded corners
> * Data-first visual hierarchy
> * Minimal but powerful interface
> * Fully responsive desktop-first design
>
> ---
>
> ### ⚡ Tech Preferences
>
> * React-based web app
> * Tailwind CSS styling
> * Reusable component structure
> * Chart libraries for analytics
> * Sticky header
> * Smooth page transitions
>
> Make it look like a real production-grade analytics system used by large educational organizations.

---

