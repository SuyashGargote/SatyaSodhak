# SatyaSodhak

SatyaSodhak is a web application designed to verify the authenticity of information using AI-powered fact-checking. This project consists of a Next.js frontend and a FastAPI backend.

## 🚀 Features

- 🔍 Fact verification using AI
- 📱 Modern, responsive UI built with Next.js and Tailwind CSS
- 🔒 Secure authentication system
- 🚀 FastAPI backend with PostgreSQL database
- 📊 Dashboard for tracking verifications

## 🛠️ Prerequisites

- Node.js (v16 or later)
- Python (3.8 or later)
- PostgreSQL (v12 or later)
- npm or yarn
- pip (Python package manager)

## 🏗️ Project Structure

```
SatyaSodhak/
├── backend/           # FastAPI backend
│   ├── main.py       # Main application file
│   ├── utils.py      # Utility functions
│   └── requirements.txt
└── frontend/         # Next.js frontend
    ├── components/   # React components
    ├── pages/        # Next.js pages
    └── styles/       # Global styles
```

## 🚀 Getting Started

### Backend Setup

1. **Create and activate a virtual environment**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

4. **Run the backend server**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Update the values in `.env.local` with your configuration

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The frontend will be available at `http://localhost:3000`

## 🌐 Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/satyasodhak
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Running Tests

```bash
# Run backend tests
cd backend
pytest

# Run frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)

---

<div align="center">
  Made with ❤️ by Your Name
</div>
