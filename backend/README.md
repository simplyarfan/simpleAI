# Enterprise AI Hub Backend

A secure, production-ready backend API for the Enterprise AI Hub application with authentication, user management, analytics, and AI agent integration.

## Features

- 🔐 **Secure Authentication**: JWT-based auth with refresh tokens, 2FA email verification
- 👥 **User Management**: Role-based access control (User, Admin, Superadmin)
- 📊 **Analytics Dashboard**: Comprehensive usage analytics and reporting
- 🎫 **Support System**: Built-in ticketing system with comments and status tracking
- 🤖 **CV Intelligence**: AI-powered resume analysis and candidate ranking
- 📧 **Email Integration**: Professional email templates and notifications
- 🛡️ **Security**: Rate limiting, input validation, SQL injection protection
- 📈 **Monitoring**: User activity tracking and system performance metrics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (easily upgradable to PostgreSQL/MySQL)
- **Authentication**: JWT with refresh tokens
- **Email**: Nodemailer with SMTP
- **File Upload**: Multer
- **Security**: Helmet, CORS, bcrypt
- **Validation**: express-validator
- **Rate Limiting**: express-rate-limit

## Quick Start

### 1. Installation

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_PATH=./database/ai_platform.db

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_super_secure_refresh_token_secret_here

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@securemaxtech.com
EMAIL_PASS=your_app_password

# Company Domain (only emails from this domain can register)
COMPANY_DOMAIN=securemaxtech.com

# Admin Email (becomes superadmin)
ADMIN_EMAIL=syedarfan@securemaxtech.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

Initialize the database:

```bash
npm run init-db
```

Seed with initial data and create superadmin:

```bash
npm run seed-db
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user (company domain only)
- `POST /login` - User login
- `POST /verify-email` - Verify email with 2FA token
- `POST /resend-verification` - Resend verification email
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /refresh-token` - Refresh access token
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /logout` - Logout current session
- `POST /logout-all` - Logout all devices

### Analytics (`/api/analytics`) - Superadmin Only
- `GET /dashboard` - Dashboard overview statistics
- `GET /users` - User analytics and activity
- `GET /agents` - Agent usage statistics
- `GET /cv-intelligence` - CV Intelligence analytics
- `GET /system` - System performance metrics
- `GET /users/:user_id/activity` - Detailed user activity
- `GET /export` - Export analytics data (JSON/CSV)

### Support System (`/api/support`)
- `POST /` - Create support ticket
- `GET /my-tickets` - Get user's tickets
- `GET /:ticket_id` - Get ticket details and comments
- `POST /:ticket_id/comments` - Add comment to ticket
- `PUT /:ticket_id` - Update ticket
- `GET /` - Get all tickets (admin only)
- `GET /admin/stats` - Support statistics (admin only)
- `DELETE /:ticket_id` - Delete ticket (admin only)

### CV Intelligence (`/api/cv-intelligence`)
- `POST /` - Create CV analysis batch (with file upload)
- `GET /my-batches` - Get user's CV batches
- `GET /batches/:batch_id` - Get batch details with candidates
- `GET /candidates/:candidate_id` - Get candidate details
- `GET /batches/:batch_id/export` - Export batch results
- `DELETE /batches/:batch_id` - Delete batch
- `GET /admin/stats` - CV Intelligence statistics (admin only)

## User Roles

### User
- Access to AI agents (CV Intelligence, etc.)
- Create and manage own CV batches
- Create and view own support tickets
- Update own profile

### Admin
- All user permissions
- View and manage all support tickets
- Access support analytics
- Assign tickets to other admins

### Superadmin
- All admin permissions
- Full analytics dashboard access
- User management capabilities
- System configuration access
- Export all data

## Security Features

### Authentication & Authorization
- JWT tokens with refresh mechanism
- Email verification (2FA)
- Password complexity requirements
- Role-based access control
- Session management with device tracking

### Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes
- Password reset: 3 attempts per hour
- File uploads: 20 uploads per hour
- CV batches: 10 batches per hour
- Support tickets: 10 tickets per day

### Data Protection
- Input validation on all endpoints
- SQL injection prevention
- XSS protection
- CORS configuration
- File upload restrictions
- Sensitive data masking in logs

## File Uploads

### CV Intelligence
- **Supported formats**: PDF, DOC, DOCX, PNG, JPG, JPEG
- **File size limit**: 10MB per file
- **Batch limit**: 50 CV files + 5 JD files per batch
- **Storage**: Local filesystem (configurable)

### Security Measures
- File type validation
- Virus scanning ready (integrate with ClamAV)
- Secure file naming
- Upload directory outside web root

## Email System

### Templates
- Welcome email after verification
- Password reset instructions
- Login alerts for security
- Support ticket notifications

### Configuration
- SMTP support (Gmail, SendGrid, etc.)
- HTML + Plain text versions
- Professional branding
- Delivery tracking

## Database Schema

### Key Tables
- `users` - User accounts and profiles
- `user_sessions` - Active login sessions
- `cv_batches` - CV analysis batches
- `cv_candidates` - Analyzed candidates
- `support_tickets` - Support tickets
- `ticket_comments` - Ticket discussions
- `user_analytics` - Activity tracking
- `agent_usage_stats` - Agent usage metrics

### Relationships
- Foreign key constraints
- Cascade deletes
- Indexed for performance
- Prepared for scaling

## Monitoring & Analytics

### User Activity Tracking
- Login/logout events
- Agent usage patterns
- Feature utilization
- Performance metrics

### System Metrics
- Registration trends
- Support ticket volume
- CV processing statistics
- Error rates and patterns

### Export Capabilities
- JSON and CSV formats
- Filtered by date ranges
- User-specific data
- Compliance ready

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=5000
DB_PATH=/app/data/ai_platform.db
JWT_SECRET=complex_production_secret
# ... other production configs
```

### Recommended Setup
1. **Reverse Proxy**: Nginx or Cloudflare
2. **Process Manager**: PM2 or Docker
3. **Database**: PostgreSQL or MySQL (upgrade from SQLite)
4. **File Storage**: AWS S3 or similar
5. **Email Service**: SendGrid or AWS SES
6. **Monitoring**: New Relic or DataDog
7. **Logging**: Winston with log rotation

### Security Checklist
- [ ] Change default JWT secrets
- [ ] Configure HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts
- [ ] Review CORS settings
- [ ] Implement virus scanning
- [ ] Set up intrusion detection

## Development

### Scripts
```bash
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run init-db      # Initialize database schema
npm run seed-db      # Seed database with initial data
```

### Code Structure
```
backend/
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/         # Database models
├── routes/         # API route definitions
├── scripts/        # Database and utility scripts
├── utils/          # Helper functions
├── uploads/        # File upload storage
└── database/       # SQLite database files
```

### Adding New Features
1. Create controller in `controllers/`
2. Add routes in `routes/`
3. Include validation in `middleware/validation.js`
4. Add rate limiting if needed
5. Update API documentation
6. Add tests

## Troubleshooting

### Common Issues

**Database locked error**
```bash
# Stop all processes and restart
npm run init-db
```

**Email not sending**
- Check SMTP credentials
- Verify app password (for Gmail)
- Check firewall/network settings

**File upload fails**
- Check upload directory permissions
- Verify disk space
- Review file size limits

**High memory usage**
- Implement file streaming for large uploads
- Add cleanup jobs for old files
- Consider external file storage

### Logs
- Check console output for errors
- Review API error responses
- Monitor rate limit headers

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## License

This project is proprietary software owned by SecureMaxTech.

## Support

For technical support or questions:
- Email: syedarfan@securemaxtech.com
- Internal documentation: [Add your internal docs link]
- Issue tracker: [Add your issue tracker link]