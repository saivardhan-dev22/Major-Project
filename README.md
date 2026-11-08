# DocVision AI
### Complete Full-Stack AI-Powered Enterprise Document Intelligence Platform
> *"Turn Business Documents Into Intelligent Decisions."*

DocVision AI is a production-grade enterprise document intelligence platform that automatically processes, understands, extracts, compares, and validates business documents (Purchase Orders, Invoices, and Goods Receipts).

---

## Architecture Overview

```
                          ┌───────────────────────────────┐
                          │     React + Vite Frontend     │
                          │   (Tailwind CSS v4 + Recharts)│
                          └──────────────┬────────────────┘
                                         │ HTTP / JSON
                                         ▼
                          ┌───────────────────────────────┐
                          │   Node.js / Express Server    │
                          │   (Auth, Routing, Security)   │
                          └───────┬──────────────┬────────┘
                                  │              │
                   MongoDB Atlas  │              │ HTTP Proxy
              ┌───────────────────┴──┐           ▼
              │   Mongoose 8.x       │    ┌───────────────────────────────┐
              │  - 10 Data Schemas   │    │     Python FastAPI Engine     │
              │  - Atlas Vector 384  │    │  - PyMuPDF (digital PDF)      │
              └──────────────────────┘    │  - EasyOCR (scanned pages)    │
                                          │  - all-MiniLM-L6-v2 (384-dim) │
                                          │  - Groq LLM (Llama-3.3-70b)   │
                                          └───────────────────────────────┘
```

---

## Key Features

1. **Intelligent Document Processing (IDP)**: PyMuPDF for digital vector PDF text extraction and EasyOCR for scanned receipts/invoices.
2. **AI-Powered Structured Extraction**: Schema extraction via Groq API into validated JSON models (Purchase Orders, Commercial Invoices, Goods Receipts).
3. **Deterministic 10-Point 3-Way Match**: Authoritative arithmetic verification of:
   - Vendor entity consistency
   - PO reference identifier match
   - Line-item catalog description & SKU
   - Ordered quantity vs invoiced quantity
   - Unit price agreement
   - Sales tax & VAT mathematical verification
   - Total amount internal balance ($Subtotal + Tax = Total$)
   - Transaction currency code uniformity
   - Document chronology ($PO \le Invoice \le Receipt$)
   - Physical dock receiving reconciliation (3-way match)
4. **Atlas Vector Search & RAG Assistant**: 384-dimensional vector embeddings using Hugging Face `all-MiniLM-L6-v2` with contextual document citations.
5. **Confidence-Aware Human Review Queue**: Findings triage based on severity and confidence. Reviewers can approve, reject, or request additional information with immutable audit logging.
6. **Executive Audit Reports**: Downloadable CSV and PDF verification reports.

---

## 10 Mongoose Data Models

1. `User` - Authentication, salted bcrypt passwords, roles (`compliance_officer`, `reviewer`, `auditor`, `admin`).
2. `RefreshToken` - Hashed refresh tokens with rotation.
3. `Document` - Ingested file metadata, OCR text, confidence scores.
4. `DocumentExtraction` - Structured JSON extraction, line items, confidence maps.
5. `DocumentChunk` - 384-dimensional embedding vectors for Atlas Vector Search.
6. `DocumentRelationship` - Graph edges connecting PO ↔ Invoice ↔ Receipt.
7. `ValidationRun` - Historical execution records with check tallies.
8. `ValidationFinding` - Individual discrepancies with expected vs actual values, page references, and recommended actions.
9. `WorkflowTask` - Reviewer tasks enqueued in the human review queue.
10. `AuditLog` - Immutable security and compliance log.

---

## Windows Local Setup Instructions (PowerShell)

### Prerequisites
- **Node.js**: v18 or v20+ installed ([nodejs.org](https://nodejs.org))
- **Python**: v3.10+ installed ([python.org](https://python.org))
- **MongoDB**: MongoDB Atlas free cluster or local MongoDB instance

---

### Step 1: Clone Repository & Configure Environment

```powershell
# In Windows PowerShell:
Copy-Item .env.example .env
```

Open `.env` in VS Code and supply your configuration:
```env
PORT=3000
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/docvision?retryWrites=true&w=majority"
GROQ_API_KEY="gsk_your_groq_api_key_here"
GROQ_MODEL="llama-3.3-70b-versatile"
JWT_SECRET="your-secure-jwt-secret-here"
PYTHON_SERVICE_URL="http://localhost:8000"
EMBEDDING_MODEL="sentence-transformers/all-MiniLM-L6-v2"
```

---

### Step 2: Install Node.js Dependencies & Run Main Server

```powershell
# Install Node dependencies
npm install

# Start full-stack server (runs on port 3000)
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

### Step 3: Set Up Python AI Microservice (PyMuPDF, EasyOCR, HuggingFace)

Open a **second PowerShell window**:

```powershell
cd python-ai-service

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start Python FastAPI service (runs on port 8000)
python main.py
```

FastAPI interactive documentation will be accessible at `http://localhost:8000/docs`.

---

## MongoDB Atlas Vector Search Index Configuration

In MongoDB Atlas, navigate to your cluster → **Atlas Search** → **Create Search Index** → **JSON Editor**.

- **Database**: `docvision`
- **Collection**: `documentchunks`
- **Index Name**: `vector_index`

Paste the following definition:
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    },
    {
      "type": "filter",
      "path": "documentId"
    }
  ]
}
```

---

## End-to-End Demonstration Workflow

1. Open `http://localhost:3000`.
2. Click **"Launch Console"** (default account `admin@docvision.ai` is pre-seeded).
3. The platform includes a benchmark 3-way match set:
   - **PO-2024-884**: Purchase Order for 10 Laptops at $1,200.00 each.
   - **INV-9921**: Commercial Invoice billing for 8 Laptops at $1,250.00 each (+$50 overcharge and 2 units backordered).
   - **REC-4412**: Warehouse Receipt confirming 8 units received at Chicago Dock B.
4. Click **"Execute 3-Way Match"** in the top navigation bar.
5. In **Validation Center**, inspect the findings:
   - **Unit Price Discrepancy (Critical)**: Expected $1,200, Actual $1,250 (+4.17% overcharge).
   - **Quantity Variance (High)**: Expected 10, Actual 8 (2 units backordered).
6. In **Relationships**, explore the PO → Invoice → Receipt topology graph.
7. In **Review Queue**, click **"Approve Exception"** or **"Reject & Dispute"** and record an auditor justification comment.
8. In **AI Assistant**, ask: *"Are there any quantity or unit price mismatches between PO-2024-884 and INV-9921?"*
9. In **Reports**, export the audit dossier as CSV.
