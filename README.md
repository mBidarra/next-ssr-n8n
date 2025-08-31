# Next.js SSR + n8n Integration

This project is a simple full-stack web application that integrates a Next.js frontend with n8n workflows.

Candidate: Matheus Bidarra.

## Project Architecture

- **Frontend:**
  - Built with [Next.js](https://nextjs.org/) (React 18, SSR/CSR hybrid)
  - UI components use [Tailwind CSS](https://tailwindcss.com/) for styling
  - Data visualization with [Recharts](https://recharts.org/)
  - Main components:
    - `AgentForm`: Chat-like interface for querying KPIs
    - `IngestButton`: Triggers data ingestion workflow
    - `MetricsChart`: Displays KPI data in bar charts
    - `Logo`: Custom SVG logo

- **Backend (API routes):**
  - Located in `app/api/agent/route.ts` and `app/api/ingest/route.ts`
  - Both endpoints act as proxies to n8n workflows:
    - `/api/agent`: Forwards user questions to an n8n agent workflow and returns KPI results
    - `/api/ingest`: Triggers a data ingestion workflow in n8n
  - Authentication to n8n is handled via HTTP Basic Auth (credentials set in environment variables)

- **n8n Integration:**
  - The app expects n8n to expose HTTP endpoints for both agent queries and ingestion
  - Environment variables configure the URLs and credentials for n8n

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- Yarn or npm
- Access to a running [n8n](https://n8n.io/) instance with the required workflows

### Installation
1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd next-ssr-n8n
   ```
2. **Install dependencies:**
   ```sh
   npm install

   ```
3. **Configure environment variables:**
   Create a `.env.local` file in the project root with the following variables:
   ```env
   N8N_AGENT_URL=<your-n8n-agent-endpoint>
   N8N_INGEST_URL=<your-n8n-ingest-endpoint>
   N8N_BASIC_AUTH_USER=<your-n8n-username>
   N8N_BASIC_AUTH_PASS=<your-n8n-password>
   N8N_TIMEOUT_MS=10000
   ```
   - `N8N_AGENT_URL`: URL for the n8n agent workflow (for KPI queries)
   - `N8N_INGEST_URL`: URL for the n8n ingestion workflow
   - `N8N_BASIC_AUTH_USER` / `N8N_BASIC_AUTH_PASS`: Credentials for n8n HTTP Basic Auth
   - `N8N_TIMEOUT_MS`: (Optional) Timeout for n8n requests in milliseconds

### Running the Project
- **Development mode:**
  ```sh
  npm run dev
  ```
  The app will be available at [http://localhost:3000](http://localhost:3000)

- **Production build:**
  ```sh
  npm run build
  npm start
  ```

### Testing
- Run unit tests with [Vitest](https://vitest.dev/):
  ```sh
  npm test
  ```

## Main Scripts
- `dev`: Start Next.js in development mode
- `build`: Build the app for production
- `start`: Start the production server
- `test`: Run tests with Vitest

## Folder Structure
- `app/` — Next.js app directory (pages, API routes, layout)
- `components/` — React UI components
- `lib/` — Helper libraries (n8n integration, env)
- `tests/` — Unit tests

## Notes
- This project is designed to work with n8n workflows that respond synchronously to HTTP requests.