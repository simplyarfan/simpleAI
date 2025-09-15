# 🚀 Enterprise AI Hub v2.0.0

[![Netlify Status](https://api.netlify.com/api/v1/badges/f84a352d-3432-4a52-ad32-15c7aaf4e5f8/deploy-status)](https://app.netlify.com/sites/thesimpleai/deploys)
[![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=thesimpleai)](https://thesimpleai.vercel.app/)

> **A production-ready, enterprise-grade AI platform with secure authentication, user management, and AI-powered tools.**

## 🌟 Live Demo

- **Frontend**: [https://thesimpleai.netlify.app](https://thesimpleai.netlify.app)
- **Backend API**: [https://thesimpleai.vercel.app](https://thesimpleai.vercel.app)
- **API Docs**: [https://thesimpleai.vercel.app/api](https://thesimpleai.vercel.app/api)

## 🎯 Key Features

### 🔐 **Enterprise Security**
- JWT-based authentication with refresh tokens
- Role-based access control (User, Admin, Superadmin)
- Rate limiting and DDoS protection
- Input validation and SQL injection prevention
- CORS and security headers

### 🤖 **AI-Powered Tools**
- **CV Intelligence**: AI-powered candidate analysis and ranking
- **Batch Processing**: Process up to 50 CVs with job descriptions
- **Smart Analytics**: Comprehensive usage and performance analytics
- **Export Capabilities**: JSON/CSV export functionality

### 👥 **User Management**
- Company domain validation (@securemaxtech.com)
- Profile management with preferences
- Multi-device session management
- Activity tracking and audit logs

### 🎫 **Support System**
- Built-in ticketing system
- Comment threads and internal notes
- Priority and category management
- Support analytics and reporting

### 📊 **Analytics Dashboard**
- Real-time usage statistics
- User activity tracking
- Agent performance metrics
- System health monitoring

## 🏗️ Technical Architecture

### Frontend (Next.js 14 + React 18)
```
📁 frontend/
├── 🎨 Modern UI with Tailwind CSS
├── ⚡ Optimized performance with SWC
├── 🔄 Smart API integration with automatic retry
├── 🍪 Secure token management
├── 📱 Responsive design for all devices
└── 🚀 Static export for fast deployment
```

### Backend (Node.js + Express)
```
📁 backend/
├── 🛡️ Security-first architecture
├── 🐘 PostgreSQL database
├── 🔧 Modular controller design
├── 📝 Comprehensive logging
├── ⚡ Performance monitoring
└── 🌐 Vercel serverless deployment
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL database (production)
- Gmail account with App Password
- Git

### 1️⃣ Clone Repository
```bash
git clone https://github.com/simplyarfan/simpleAI.git
cd simpleAI
```

### 2️⃣ Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Initialize database
npm run init-db

# Start development server
npm run dev
```

### 3️⃣ Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev
```

### 4️⃣ Environment Configuration

**Backend (.env)**
```env
# Database (Required)
POSTGRES_URL=postgresql://username:password@hostname:port/database

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters_long
REFRESH_TOKEN_SECRET=your_super_secure_refresh_token_secret_at_least_32_characters_long

# Email Configuration
EMAIL_USER=your_email@securemaxtech.com
EMAIL_PASS=your_gmail_app_password

# Company Settings
COMPANY_DOMAIN=securemaxtech.com
ADMIN_EMAIL=admin@securemaxtech.com
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=https://thesimpleai.vercel.app/api
NEXT_PUBLIC_API_URL_LOCAL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Enterprise AI Hub
NEXT_PUBLIC_COMPANY_DOMAIN=securemaxtech.com
```

## 📋 API Documentation

### Authentication Endpoints
```http
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
POST   /api/auth/logout            # Logout current session
POST   /api/auth/logout-all        # Logout all sessions
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
GET    /api/auth/profile           # Get user profile
PUT    /api/auth/profile           # Update user profile
```

### CV Intelligence Endpoints
```http
POST   /api/cv-intelligence        # Create CV batch
GET    /api/cv-intelligence/my-batches  # Get user batches
GET    /api/cv-intelligence/batches/:id # Get batch details
DELETE /api/cv-intelligence/batches/:id # Delete batch
```

### Support Endpoints
```http
POST   /api/support                # Create support ticket
GET    /api/support/my-tickets     # Get user tickets
GET    /api/support/:id            # Get ticket details
POST   /api/support/:id/comments   # Add comment to ticket
```

### Analytics Endpoints (Superadmin)
```http
GET    /api/analytics/dashboard    # Dashboard statistics
GET    /api/analytics/users        # User analytics
GET    /api/analytics/agents       # Agent usage statistics
GET    /api/analytics/export       # Export analytics data
```

## 🛠️ Development

### Project Structure
```
📦 Enterprise AI Hub
├── 📁 backend/
│   ├── 📁 controllers/     # Request handlers
│   ├── 📁 middleware/      # Express middleware
│   ├── 📁 models/          # Database models
│   ├── 📁 routes/          # API routes
│   ├── 📁 scripts/         # Database scripts
│   ├── 📁 utils/           # Helper functions
│   └── 📄 server.js        # Main server file
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/  # Reusable components
│   │   ├── 📁 contexts/    # React contexts
│   │   ├── 📁 pages/       # Next.js pages
│   │   ├── 📁 styles/      # CSS files
│   │   └── 📁 utils/       # Helper functions
│   └── 📄 next.config.js   # Next.js configuration
└── 📄 README.md            # This file
```

### Development Scripts

**Backend**
```bash
npm run dev       # Start development server
npm run start     # Start production server
npm run init-db   # Initialize database
npm run seed-db   # Seed database with test data
```

**Frontend**
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run export    # Export static files
```

### Adding New Features

1. **Backend**: Create controller → Add routes → Update validation → Test endpoints
2. **Frontend**: Create components → Add pages → Update contexts → Test UI
3. **Database**: Add migrations → Update models → Test queries
4. **Documentation**: Update API docs → Update README

## 🚀 Production Deployment

### Recommended Infrastructure
- **Frontend**: Netlify (Current: https://thesimpleai.netlify.app)
- **Backend**: Vercel (Current: https://thesimpleai.vercel.app)
- **Database**: PostgreSQL (Vercel Postgres, AWS RDS, or similar)
- **Email**: Gmail SMTP (production-ready)
- **File Storage**: Vercel filesystem (upgradeable to AWS S3)

### Deployment Steps

1. **Environment Setup**
   ```bash
   # Set production environment variables
   # Update CORS origins
   # Configure database connection
   # Set up email credentials
   ```

2. **Database Migration**
   ```bash
   # If migrating from SQLite to PostgreSQL
   npm run init-db  # Initialize new PostgreSQL database
   ```

3. **Frontend Deployment (Netlify)**
   ```bash
   # Netlify automatically deploys from GitHub
   # Build command: npm run build
   # Publish directory: out
   ```

4. **Backend Deployment (Vercel)**
   ```bash
   # Vercel automatically deploys from GitHub
   # Entry point: server.js
   # Environment: Node.js
   ```

## 🔒 Security Features

### Authentication & Authorization
- ✅ JWT with refresh token rotation
- ✅ Secure password hashing (bcrypt)
- ✅ Role-based access control
- ✅ Session management across devices
- ✅ Email verification system

### API Security
- ✅ Rate limiting (100 requests/15 minutes)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ File upload security

### Data Protection
- ✅ Environment-based configuration
- ✅ Secure cookie settings
- ✅ HTTPS enforcement (production)
- ✅ Activity logging and audit trails
- ✅ Error handling without data leakage

## 📊 Performance Optimizations

### Frontend
- ⚡ Next.js 14 with SWC minification
- ⚡ Image optimization and WebP support
- ⚡ Static export for faster loading
- ⚡ Optimized bundle size
- ⚡ Lazy loading and code splitting

### Backend
- ⚡ Connection pooling for database
- ⚡ Response compression (gzip)
- ⚡ Request/response time monitoring
- ⚡ Optimized SQL queries
- ⚡ Caching strategies

### Database
- ⚡ PostgreSQL with optimized indexes
- ⚡ Connection pooling
- ⚡ Query optimization
- ⚡ Foreign key constraints
- ⚡ JSONB for flexible data storage

## 🧪 Testing & Quality

### Current Status
- ✅ Manual testing completed
- ✅ Production deployment tested
- ✅ Cross-browser compatibility verified
- ✅ Mobile responsiveness confirmed
- ⏳ Automated testing (coming soon)

### Future Testing Plans
- Unit tests with Jest
- Integration tests for API endpoints
- End-to-end testing with Cypress
- Performance testing and monitoring
- Security testing and audits

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add new feature"`
5. Push to your branch: `git push origin feature/new-feature`
6. Submit a pull request

### Development Guidelines
- Follow existing code style and patterns
- Add appropriate error handling
- Update documentation for new features
- Ensure security best practices
- Test on both development and production environments

## 📞 Support & Contact

### Technical Support
- **Email**: syedarfan@securemaxtech.com
- **GitHub Issues**: [Create an issue](https://github.com/simplyarfan/simpleAI/issues)
- **Support System**: Use the built-in support ticket system

### Documentation
- **API Documentation**: [https://thesimpleai.vercel.app/api](https://thesimpleai.vercel.app/api)
- **Frontend Guide**: Check `/frontend/README.md` (if available)
- **Backend Guide**: Check `/backend/README.md` (if available)

## 📄 License

This project is proprietary software owned by **SecureMaxTech**.

## 🎉 What's Next?

### Immediate Roadmap (v2.1.0)
- [ ] Automated testing suite
- [ ] API documentation with Swagger
- [ ] Advanced analytics dashboard
- [ ] Email templates optimization
- [ ] Performance monitoring dashboard

### Future Features (v3.0.0)
- [ ] Document Analyzer agent
- [ ] Meeting Assistant agent
- [ ] Multi-language support
- [ ] Mobile applications (iOS/Android)
- [ ] Third-party integrations (Slack, Teams)
- [ ] Advanced AI model integrations
- [ ] Workflow automation
- [ ] Real-time collaboration features

## 🎯 Key Metrics

### Performance
- ⚡ Page load time: < 2 seconds
- ⚡ API response time: < 500ms
- ⚡ 99.9% uptime target
- ⚡ Mobile performance score: 90+

### Security
- 🛡️ Zero known vulnerabilities
- 🛡️ OWASP compliance
- 🛡️ Regular security audits
- 🛡️ Encrypted data transmission

### User Experience
- 📱 Mobile-first responsive design
- 🎨 Modern, intuitive interface
- ♿ Accessibility compliant
- 🌐 Cross-browser compatibility

---

**Built with ❤️ by SecureMaxTech | Enterprise AI Hub v2.0.0**

*Last Updated: September 2025*
