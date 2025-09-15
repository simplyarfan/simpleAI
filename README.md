# Enterprise AI Hub

[![Netlify Status](https://api.netlify.com/api/v1/badges/f84a352d-3432-4a52-ad32-15c7aaf4e5f8/deploy-status)](https://app.netlify.com/sites/thesimpleai/deploys)
[![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=thesimpleai)](https://thesimpleai.vercel.app/)

A comprehensive, production-ready AI platform for enterprise use with secure authentication, user management, and AI-powered tools.

## 🎯 Overview

Enterprise AI Hub is a full-stack application that provides:

- **🔐 Secure Authentication**: JWT-based auth with email verification
- **🤖 AI Agents**: CV Intelligence with batch processing capabilities
- **👥 User Management**: Role-based access control (User, Admin, Superadmin)
- **📊 Analytics**: Comprehensive usage analytics and reporting
- **🎫 Support System**: Built-in ticketing system
- **📱 Responsive Design**: Works on desktop, tablet, and mobile

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT with refresh tokens
- **UI Components**: Custom components with Lucide icons
- **Notifications**: React Hot Toast

### Backend (Node.js)
- **Framework**: Express.js
- **Database**: SQLite (production-ready, easily upgradable)
- **Authentication**: JWT with refresh token rotation
- **Email**: Nodemailer with SMTP support
- **File Upload**: Multer with security validation
- **Security**: Helmet, CORS, rate limiting, input validation
- **Analytics**: Comprehensive activity tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Gmail account with App Password (for emails)
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd ai_platform

# Setup backend
cd backend
chmod +x setup.sh
./setup.sh

# In a new terminal, setup frontend
cd ../frontend
npm install
```

### 2. Backend Configuration

Edit `backend/.env`:
```env
# Database
DB_PATH=./database/ai_platform.db

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your_super_secure_jwt_secret_here_change_me
REFRESH_TOKEN_SECRET=your_super_secure_refresh_token_secret_change_me

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@securemaxtech.com
EMAIL_PASS=your_gmail_app_password

# Company Settings
COMPANY_DOMAIN=securemaxtech.com
ADMIN_EMAIL=syedarfan@securemaxtech.com

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3. Gmail Setup (for email notifications)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings → Security → App passwords
3. Generate an app password for "Mail"
4. Use this 16-character password in `EMAIL_PASS`

### 4. Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Your app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

### 5. First Login

1. Go to http://localhost:3000
2. Register with your @securemaxtech.com email
3. Check email for verification link
4. Login with your credentials

The first user with the `ADMIN_EMAIL` becomes a superadmin automatically.

## 📋 Features

### Authentication & Security
- [x] User registration with company domain validation
- [x] Email verification (2FA)
- [x] Secure login with JWT tokens
- [x] Password reset functionality
- [x] Session management across devices
- [x] Rate limiting on all endpoints
- [x] Input validation and sanitization
- [x] CORS protection
- [x] SQL injection prevention

### User Management
- [x] Role-based access control
- [x] User profiles with preferences
- [x] Activity tracking
- [x] Multi-device session management

### AI Agents
- [x] **CV Intelligence**: Upload CVs and job descriptions for AI-powered candidate analysis
  - Batch processing (up to 50 CVs + 5 JDs)
  - Smart candidate ranking
  - Detailed analysis reports
  - Export results (JSON/CSV)
- [ ] **Document Analyzer**: Coming soon
- [ ] **Meeting Assistant**: Coming soon

### Support System
- [x] Support ticket creation
- [x] Ticket comments and updates
- [x] Admin ticket management
- [x] Support analytics

### Analytics (Superadmin)
- [x] User analytics
- [x] Agent usage statistics
- [x] System performance metrics
- [x] Export capabilities
- [x] Activity tracking

## 🛠️ Development

### Backend Structure
```
backend/
├── controllers/        # Request handlers
├── middleware/        # Express middleware
├── models/           # Database models
├── routes/           # API routes
├── scripts/          # Database scripts
├── utils/            # Helper functions
├── uploads/          # File storage
└── database/         # SQLite files
```

### Frontend Structure
```
frontend/src/
├── components/       # Reusable components
├── contexts/         # React contexts
├── pages/           # Next.js pages
├── styles/          # CSS files
└── utils/           # Helper functions
```

### Adding New Features

1. **Backend**: Create controller → Add routes → Include validation → Add tests
2. **Frontend**: Create pages/components → Add to navigation → Update contexts
3. **Database**: Add migrations if needed
4. **Documentation**: Update README and API docs

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### CV Intelligence
- `POST /api/cv-intelligence` - Create CV batch
- `GET /api/cv-intelligence/my-batches` - Get user batches
- `GET /api/cv-intelligence/batches/:id` - Get batch details
- `DELETE /api/cv-intelligence/batches/:id` - Delete batch

#### Support
- `POST /api/support` - Create ticket
- `GET /api/support/my-tickets` - Get user tickets
- `GET /api/support/:id` - Get ticket details
- `POST /api/support/:id/comments` - Add comment

#### Analytics (Superadmin)
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/users` - User analytics
- `GET /api/analytics/agents` - Agent usage stats

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
# Required
DB_PATH=./database/ai_platform.db
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
EMAIL_USER=your_email@securemaxtech.com
EMAIL_PASS=your_app_password
COMPANY_DOMAIN=securemaxtech.com
ADMIN_EMAIL=admin@securemaxtech.com

# Optional
PORT=5000
FRONTEND_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Enterprise AI Hub
NEXT_PUBLIC_COMPANY_DOMAIN=securemaxtech.com
```

### Database Schema

The application uses SQLite with a comprehensive schema including:
- Users and authentication
- CV batches and candidates
- Support tickets and comments
- Analytics and activity tracking
- System settings and preferences

Schema is automatically created when running `npm run init-db`.

## 🚀 Production Deployment

### Recommended Stack
- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Backend**: AWS EC2, DigitalOcean, or Railway
- **Database**: PostgreSQL or MySQL (upgrade from SQLite)
- **File Storage**: AWS S3 or similar
- **Email**: SendGrid, AWS SES, or Mailgun
- **Monitoring**: New Relic, DataDog, or Sentry

### Environment Setup

1. **Frontend Deployment**:
   ```bash
   npm run build
   npm start
   ```

2. **Backend Deployment**:
   ```bash
   NODE_ENV=production
   npm start
   ```

3. **Database Migration** (for production):
   - Migrate from SQLite to PostgreSQL/MySQL
   - Run database migrations
   - Set up backups

4. **Security Checklist**:
   - [ ] Change all default secrets
   - [ ] Set up HTTPS/SSL
   - [ ] Configure firewalls
   - [ ] Set up monitoring
   - [ ] Enable audit logging
   - [ ] Configure backups
   - [ ] Review CORS settings

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens, email verification
- **Authorization**: Role-based access control
- **Data Protection**: Input validation, SQL injection prevention
- **Rate Limiting**: Configurable limits on all endpoints
- **File Security**: Type validation, size limits, secure storage
- **Session Management**: Multi-device support, secure logout
- **Audit Logging**: Complete activity tracking

## 📊 Analytics & Monitoring

### Built-in Analytics
- User registration and activity patterns
- Agent usage statistics
- Support ticket metrics
- System performance tracking

### Metrics Tracked
- Login/logout events
- Feature usage patterns
- Error rates and patterns
- Processing times
- File upload statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Guidelines
- Follow existing code style
- Add appropriate tests
- Update documentation
- Ensure security best practices

## 📞 Support

For technical support:
- **Email**: syedarfan@securemaxtech.com
- **Documentation**: See `/backend/README.md` for detailed backend docs
- **Issues**: Use the built-in support ticket system

## 📄 License

This project is proprietary software owned by SecureMaxTech.

## 🎉 What's Next?

### Coming Soon
- [ ] Document Analyzer agent
- [ ] Meeting Assistant agent
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] API webhooks
- [ ] Third-party integrations

### Roadmap
- Multi-language support
- Advanced AI models integration
- Workflow automation
- Real-time collaboration
- Advanced security features

---

Built with ❤️ by SecureMaxTech