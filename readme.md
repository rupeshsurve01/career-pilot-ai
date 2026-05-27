# ✈️ CareerPilot-AI

**CareerPilot-AI** is a premium, AI-driven "Command Center" for job seekers. It bridges the gap between candidates and Applicant Tracking Systems (ATS) by leveraging the power of the Google Gemini LLM to optimize professional profiles and navigate the complex journey from application to interview.

---

## 🚀 Features

### 📝 Strategic Resume Optimization
*   **ATS Alignment:** Automatically rewrites and reformats your experience to align with specific Job Descriptions while maintaining 100% factual accuracy.
*   **High-Fidelity Rendering:** Utilizes Puppeteer to generate professional, modern, and print-ready PDF resumes using a refined typography-first design system.
*   **Interactive PDFs:** Generated resumes include clickable contact links (LinkedIn, GitHub, Email) for better recruiter engagement.

### 🎯 Interview Intelligence
*   **Tailored Q&A:** Generates custom technical and behavioral questions based on the intersection of your profile and the target role.
*   **Recruiter Intent Analysis:** Breaks down *why* a question is being asked and provides high-impact "model answers."
*   **Skill Gap Analysis:** Identifies specific areas where you might be weak relative to a job description, assigned with a severity score (Low, Medium, High).

### 📅 7-Day Flight Plan
*   **Structured Preparation:** A day-by-day roadmap designed to get you interview-ready in exactly one week, focusing on specific tasks and technical deep-dives.

---

## 🛠️ Tech Stack

### Backend (The Engines)
*   **Node.js & Express:** Robust API architecture.
*   **Google Gemini (Pro & Flash):** Advanced LLM integration for structured JSON generation.
*   **Zod:** Strict schema validation to ensure AI outputs are predictable and reliable.
*   **Puppeteer:** For pixel-perfect HTML-to-PDF conversion.
*   **MongoDB:** Scalable document storage for interview reports and user data.

### Frontend (The Cockpit)
*   **React:** Modern, component-based user interface.
*   **SCSS:** Custom glassmorphic SaaS aesthetic with a dark-themed UI.
*   **Lucide Icons:** Clean, minimalist iconography for a professional look.

---

## ⚙️ Project Architecture

CareerPilot-AI is built with a focus on reliability and quality:
*   **Multi-Model Fallback:** The AI service automatically retries generation across multiple Gemini models (2.5-flash, 2.0-flash) if one is busy or fails.
*   **Job Queueing:** Implements an internal queue for AI tasks to handle concurrent requests gracefully.
*   **Schema-First Design:** Every AI interaction is governed by Zod schemas, preventing UI crashes from malformed AI responses.

---

## 🚥 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB
*   A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <https://github.com/your-username/CareerPilot.git>
    cd CareerPilot
    ```

2.  **Setup Backend:**
    ```bash
    cd Backend
    npm install
    ```
    Create a `.env` file:
    ```ini
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    GOOGLE_GENAI_API_KEY=your_gemini_api_key
    JWT_SECRET=your_secret_key
    ```

3.  **Setup Frontend:**
    ```bash
    cd ../Frontend
    npm install
    ```

4.  **Run the application:**
    *   Backend: `npm start` (or `npm run dev` with nodemon)
    *   Frontend: `npm run dev`

---

## 📁 Project Structure

```text
├── Backend
│   ├── src
│   │   ├── controllers # Request handlers
│   │   ├── models      # Mongoose schemas
│   │   ├── services    # AI logic & PDF generation
│   │   └── routes      # API endpoints
├── Frontend
│   ├── src
│   │   ├── features    # Core app modules (Auth, Interview)
│   │   ├── hooks       # Custom React hooks
│   │   └── style       # SCSS themes & layouts
```

---
