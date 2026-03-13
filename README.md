# Internal Developer Q&A Helper

A proof-of-concept AI orchestration tool acting as a company's internal developer Q&A assistant. The application uses modern Web technologies and the Vercel AI SDK to search a static knowledge base of documents and experts, routing strictly company-specific questions while blocking leaks, off-topic prompts, and injections through a 3-layer security system.

## Features

- **Naive RAG (Context Stuffing)**: Directly feeds a verified internal dataset (`knowledge_data.json`) to the LLM to provide grounded, 100% accurate answers.
- **Expert Routing**: Gracefully handles missing documentation by suggesting human experts based on their skills and availability status.
- **3-Layer Security Guardrails**: Input injection detection, rigid system instructions, and output sanity validation to protect proprietary prompts.
- **Provider-Agnostic AI**: Configured for Google Gemini and OpenAI, but easily swappable via the AI SDK.
- **Real-Time UI**: A sleek, dark-mode glassmorphism interface built with React and Tailwind CSS.

## Prerequisites

- **Node.js**: v18 or newer
- **pnpm**: `npm install -g pnpm`
- **Google Gemini API Key**: Get one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Setup & Running Locally

1. Clone the repository:

   ```bash
   git clone <repo>
   cd etnetera-interview-assignment
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Open `.env` and paste your AI provider API keys.

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open your browser to [http://localhost:5173](http://localhost:5173).

## Architecture

This project is built using:

- **React Router v7** (Framework Mode)
- **Vite**
- **Tailwind CSS**
- **Vercel AI SDK**

For full technical details on the architecture (including the 3-layer security model), see [tech-spec.md](./tech-spec.md). For details on how the autonomous agent workflow built this project, see [agents.md](./agents.md).
