# Codebase Memory Explorer

A MERN + RAG web application that turns Git repositories into self-explainable systems.

## 🎯 Features

### User Authentication
- ✅ User signup and login
- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Protected routes
- ✅ Secure logout
- ✅ Per-user data isolation

### Repository Management
- ✅ Add local Git repositories
- ✅ Clone from GitHub URLs
- ✅ Repository validation
- ✅ Automatic analysis on add
- ✅ Real-time progress tracking
- ✅ Soft delete repositories

### Code Analysis Engine
- ✅ Parse Git history
- ✅ Extract commits with stats
- ✅ Extract files and content
- ✅ Parse code (AST) for JavaScript/TypeScript/Python
- ✅ Extract functions and methods
- ✅ Extract imports and exports
- ✅ Build dependency graph
- ✅ Generate embeddings

### Visualization
- ✅ Interactive dependency graph (file-level and function-level)
- ✅ Zoom, pan, and click interactions
- ✅ Node coloring by language/type
- ✅ Evolution timeline with charts
- ✅ Daily commit stats
- ✅ Click commit to see changed files

### RAG Q&A System
- ✅ Ask natural language questions
- ✅ Semantic search with embeddings
- ✅ Context retrieval from multiple sources
- ✅ GPT-4o mini integration for answers
- ✅ Source citations (files, functions, commits, graph nodes)
- ✅ Explainable answers
- ✅ Question history

## 🛠 Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- simple-git for Git operations
- acorn for JavaScript/TypeScript AST parsing
- OpenAI API for embeddings and completions

### Frontend
- React 18 with Vite
- React Router v6
- Tailwind CSS
- react-force-graph-2d for dependency visualization
- Recharts for timeline charts
- Lucide React for icons
- date-fns for date formatting

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git
- OpenAI API key (optional, for full RAG functionality)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env with your settings:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A secure secret for JWT
# - OPENAI_API_KEY: Your OpenAI API key (optional)

# Start the server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🚀 Usage

1. **Sign Up**: Create an account at http://localhost:5173/signup

2. **Add Repository**: 
   - Click "Add Repository" on the dashboard
   - Choose GitHub URL or local path
   - Wait for analysis to complete

3. **Explore Repository**:
   - View files, functions, and commits
   - See dependency graph (file or function level)
   - Browse evolution timeline

4. **Ask Questions**:
   - Go to "Ask Questions" for any repository
   - Type natural language questions
   - Get answers with source citations

5. **View History**:
   - Access past questions and answers
   - Re-open previous conversations

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Repositories
- `GET /api/repositories` - List user's repositories
- `GET /api/repositories/:id` - Get repository details
- `POST /api/repositories` - Add new repository
- `DELETE /api/repositories/:id` - Soft delete repository
- `POST /api/repositories/:id/analyze` - Re-analyze repository

### Repository Data
- `GET /api/repositories/:id/commits` - Get commits
- `GET /api/repositories/:id/files` - Get files
- `GET /api/repositories/:id/files/:fileId` - Get file content
- `GET /api/repositories/:id/functions` - Get functions
- `GET /api/repositories/:id/graph` - Get dependency graph
- `GET /api/repositories/:id/timeline` - Get evolution timeline

### Q&A
- `POST /api/repositories/:id/ask` - Ask a question
- `GET /api/repositories/:id/questions` - Get question history
- `GET /api/questions/:id` - Get question details

## 🗄 Data Models

- **User**: Authentication and profile
- **Repository**: Git repo metadata and analysis status
- **Commit**: Git commits with stats
- **File**: Source files with content
- **Function**: Extracted functions/methods
- **Dependency**: File and function relationships
- **Embedding**: Vector embeddings for semantic search
- **Question**: User questions
- **Answer**: AI-generated answers with sources

## ⚙️ Configuration

### Environment Variables

```env
# Server
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/codebase-memory-explorer

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# OpenAI (optional)
OPENAI_API_KEY=your-openai-api-key

# Storage
REPOS_BASE_PATH=./repositories
```

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with configurable expiration
- Protected API routes
- Per-user data isolation
- Input validation
- Error handling middleware

## 📝 Notes

- The app works without an OpenAI API key, but Q&A will return limited responses
- Large repositories may take several minutes to analyze
- Binary files and node_modules are automatically excluded from analysis
- The dependency graph is built from import statements and function calls

## 🐛 Troubleshooting

**MongoDB Connection Failed**
- Ensure MongoDB is running locally or use a valid Atlas connection string

**Analysis Stuck**
- Check backend console for errors
- Ensure the repository path is valid and accessible
- Try re-analyzing the repository

**Q&A Not Working**
- Verify your OpenAI API key is set correctly
- Check that the repository analysis is complete (status: "ready")

## 📄 License

MIT License

---

Built with ❤️ as a demonstration of MERN + RAG architecture
