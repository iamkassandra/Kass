# AI Agent Team - Autonomous Development Platform

🤖 **Advanced Multi-Agent AI System for Autonomous Business Development**

An enterprise-grade platform that leverages specialized AI agents to autonomously develop, test, and deploy complete web applications from business ideas to production-ready solutions.

## 🌟 Features

### 🧠 Advanced AI Capabilities
- **Vector Memory System**: Semantic knowledge storage with 384-dimensional embeddings
- **Cross-Agent Learning**: Knowledge transfer between specialized agents
- **Real-time Collaboration**: Live communication bus with WebSocket support
- **Code Execution**: Sandboxed environment with security policies
- **Automated Testing**: Comprehensive QA with performance monitoring

### 🔒 Enterprise Security
- **JWT Authentication**: Secure token-based authentication system
- **Role-Based Access**: Admin and user role management
- **Session Management**: Automatic session cleanup and token refresh
- **Secure Communication**: WebSocket authentication and authorization
- **Password Security**: bcrypt hashing with salt rounds

### 🤖 Specialized AI Agents
- **Executive Agent**: Business strategy, risk assessment, project coordination
- **Engineer Agent**: Full-stack development, technical architecture, code generation
- **Designer Agent**: UI/UX design, branding, accessibility compliance
- **Legal Agent**: GDPR compliance, age verification, content moderation
- **Marketing Agent**: SEO strategy, content marketing, growth analytics
- **DevOps Agent**: CI/CD pipelines, infrastructure, monitoring, security
- **Testing Agent**: Automated QA, performance testing, quality gates

### 🚀 Demo Capabilities
- Autonomous business idea to application pipeline
- Real-time agent activity monitoring with WebSocket
- Live knowledge sharing visualization
- System performance metrics
- 7-phase development workflow automation
- Secure user authentication and session management

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with custom theming
- **Authentication**: JWT with refresh tokens, bcrypt password hashing
- **Database**: SQLite with better-sqlite3
- **Real-time**: WebSocket server with client management
- **Package Manager**: Bun
- **Deployment**: Vercel with custom domain support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-agent-team.git
   cd ai-agent-team
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:
   ```env
   JWT_SECRET=your-jwt-secret-key
   REFRESH_SECRET=your-refresh-secret-key
   ADMIN_PASSWORD=secure-admin-2024
   WS_PORT=8080
   ```

4. **Start the development server**
   ```bash
   bun run dev
   ```

5. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login
- **Username**: `admin`
- **Password**: `admin123` (for local development) or `secure-admin-2024` (for production)

## 📖 Usage

### Authentication
The platform includes a comprehensive authentication system with secure login/logout functionality. Users are automatically redirected to the login page if not authenticated.

### Agent Dashboard
Access the main dashboard to monitor all AI agents, view system statistics, and manage active tasks and projects.

### Autonomous Demo
Try the autonomous business development demo at `/demo` to experience the full AI agent workflow:

1. Enter a business idea
2. Watch AI agents collaborate in real-time
3. Monitor progress through 7 development phases
4. View the generated application

### WebSocket Integration
Real-time communication is available through WebSocket connections at `ws://localhost:8080/ws/agents` with authentication and subscription-based event handling.

## 🏗️ Architecture

### Agent System
```
AgentManager
├── ExecutiveAgent (Strategy & Coordination)
├── EngineerAgent (Development & Architecture)
├── DesignerAgent (UI/UX & Branding)
├── LegalAgent (Compliance & Regulations)
├── MarketingAgent (SEO & Growth)
├── DevOpsAgent (Infrastructure & Deployment)
└── TestingAgent (QA & Performance)
```

### Communication Flow
```
WebSocket Server ↔ RealTimeBus ↔ Agent Manager ↔ Individual Agents
                                      ↓
                              Vector Memory System
                                      ↓
                             Code Execution Environment
```

## 🔧 Configuration

### Environment Variables
- `JWT_SECRET`: Secret key for JWT token signing
- `REFRESH_SECRET`: Secret key for refresh token signing
- `ADMIN_PASSWORD`: Default admin password (change in production)
- `WS_PORT`: WebSocket server port (default: 8080)
- `NODE_ENV`: Environment mode (development/production)

### Database
The platform uses SQLite for data persistence with automatic table creation and migration support.

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic deployments on push

### Custom Domain
1. Add your domain in Vercel dashboard
2. Configure DNS settings
3. SSL certificates are automatically managed

## 🧪 Testing

Run the test suite:
```bash
bun test
```

Run linting:
```bash
bun run lint
```

## 📄 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Get current user

### Agent Endpoints
- `GET /api/agents` - List all agents
- `POST /api/agents/{id}/tasks` - Create agent task
- `GET /api/agents/{id}/status` - Get agent status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository

## 🙏 Acknowledgments

- Powered by Next.js and React
- UI components from shadcn/ui
- Real-time capabilities with WebSocket

---

**🎉 Ready for autonomous business development with advanced AI capabilities!**
