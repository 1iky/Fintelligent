# Fintelligent ![Fintelligent Logo](add-in/assets/chaticon-32.png)

### *Where Finance meets Intelligence*

**Fintelligent** is an innovative AI-powered add-in for Excel, designed to streamline financial workflows, enhance productivity, and support informed decision-making. By integrating automation, advanced data processing, and AI-driven financial analysis, **Fintelligent** empowers users to effortlessly build, analyze, and refine financial models. With its natural language interface, you can ask questions about your data, explain complex formulas, and even generate insights or summaries. Fintelligent transforms your Excel experience by making financial modeling faster, smarter, and more accessible for everyone.

![Fintelligent Excel](add-in/assets/excelscreen.png)

## Features
### AI-Powered Financial Assistance
- Ask questions directly in Excel environment
- Get explanations for complex concepts
- Get AI suggested improvements

### Automated Data Handling  
- Streamline data entry
- Automate formatting
- Simplify repetitive calculations

### Instant Insights & Analysis
- Real-time trend analysis
- Automated summaries  
- Quick financial calculations

### Multi-Sheet Support
- Manage and analyze multiple sheets within a single Excel file
- Interact with data across different sheets seamlessly

## Technology Stack

### Backend
- OpenAI API (GPT-4)
- FastAPI
- Pandas for data processing
- xlwings for Excel integration
- Uvicorn ASGI server

### Frontend
- React
- Office JavaScript API
- Material-UI components

## Getting Started

### Prerequisites
- Microsoft Excel (version supporting add-ins)
- Python 3.11 or later
- Node.js and npm

### Backend Setup
1. Clone the repository
2. Navigate to the backend directory:
  ```bash
  cd backend
  ```
3. Create a .env file with your OpenAI API key:
  ```bash
  OPENAI_API_KEY = YOUR_API_KEY
  ```
4. Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
5. Start the server:
  ```bash
  python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  ```
### Frontend Setup
1. Navigate to the frontend directory:
  ```bash
  cd frontend
  ```
2. Install dependencies:
  ```bash
  npm install
  ```
3. Start the development server:
  ```bash
  npm start
  ```
