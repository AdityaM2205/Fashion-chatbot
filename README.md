# Fashion Assistant Chatbot

A modern, AI-powered fashion assistant chatbot that provides style advice, outfit recommendations, and fashion tips.

## Features

- 💬 Interactive chat interface with real-time messaging
- 🌓 Light and dark mode support
- 🎨 Beautiful UI built with React, TypeScript, and shadcn/ui
- 🚀 FastAPI backend with potential for LLM integration
- 🔄 Real-time updates with WebSocket support (ready to implement)

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Hooks
- **Build Tool**: Vite

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Python 3.8+
- pip

## Getting Started

### Frontend Setup

1. Navigate to the project directory:
   ```bash
   cd fashion-chatbot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`
   API documentation will be available at `http://localhost:8000/docs`

## Project Structure

```
fashion-chatbot/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main FastAPI application
│   └── requirements.txt    # Python dependencies
├── public/                 # Static files
├── src/
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utility functions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Connecting to an LLM

To enhance the chatbot with a more sophisticated AI, you can connect it to an open-source LLM fine-tuned on fashion data. Here's how:

1. Set up your preferred LLM (e.g., LLaMA, GPT-J) on a server
2. Update the `generate_response` function in `backend/main.py` to call your LLM API
3. Update the API endpoint in `src/App.tsx` to point to your LLM service

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [FastAPI](https://fastapi.tiangolo.com/) for the high-performance backend
