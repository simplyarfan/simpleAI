# Enterprise AI Hub

A comprehensive AI platform for enterprise workflows with role-based access control, analytics, and automated agent systems.

## Features

### **Core Platform**
- **User Authentication & Authorization**: Secure login/registration with role-based access control
- **Superadmin Dashboard**: System analytics, user management, support tickets, system health monitoring
- **Regular User Dashboard**: Access to AI agents, support system, profile management
- **Real-time Updates**: Dynamic data updates from database without sample data

### **AI Agents**
- **CV Intelligence**: AI-powered resume parsing, analysis, and candidate ranking
- **Interview Coordinator**: Smart scheduling and interview automation (Coming Soon)
- **Onboarding Assistant**: Streamlined employee onboarding workflows (Coming Soon)
- **HR Analytics Engine**: Advanced people analytics and insights (Coming Soon)

### **Admin Features**
- **User Management**: Full CRUD operations on user accounts
- **Analytics Dashboard**: System-wide performance metrics and usage statistics
- **Support Ticket System**: Complete ticket management with admin resolution
- **System Health Monitoring**: Real-time system status and performance alerts

## Tech Stack

### **Frontend**
- **Framework**: Next.js 13+ with React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **HTTP Client**: Axios with token management

### **Backend**
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer for multipart form handling
- **Security**: bcrypt, rate limiting, CORS protection
- **Validation**: express-validator

## Architecture

```
Frontend (Netlify) -> Backend API (Vercel) -> PostgreSQL Database
```

## Quick Start

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database
- Git

### **Environment Variables**

**Backend (.env)**:
```env
NODE_ENV=production
PORT=5000
POSTGRES_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret_32_chars_minimum
REFRESH_TOKEN_SECRET=your_secure_refresh_secret_32_chars_minimum
ADMIN_EMAIL=admin@securemaxtech.com
DEFAULT_ADMIN_PASSWORD=ChangeThisPassword123!
FRONTEND_URL=https://thesimpleai.netlify.app
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=https://thesimpleai.vercel.app/api
NEXT_PUBLIC_APP_NAME=Enterprise AI Hub
```

### **Database Setup**

The application automatically creates the required database schema on first run, including:
- Users table with role-based permissions
- Authentication sessions management
- CV processing batches and candidates
- Support ticket system
- User analytics and activity tracking
- Agent usage statistics

### **Default Admin Account**

A default superadmin account is automatically created:
- **Email**: `syedarfan@securemaxtech.com` (or your ADMIN_EMAIL)
- **Password**: Value from `DEFAULT_ADMIN_PASSWORD` env var
- **Role**: `superadmin`

**⚠️ SECURITY**: Change the default admin password immediately after first login!

## Development

### **Local Development**

1. **Clone Repository**:
```bash
git clone https://github.com/simplyarfan/simpleAI.git
cd simpleAI
```

2. **Backend Setup**:
```bash
cd backend
npm install
# Set up .env file
npm run dev
```

3. **Frontend Setup**:
```bash
cd frontend
npm install
# Set up .env.local file
npm run dev
```

### **Deployment**

**Backend (Vercel)**:
- Automatically deploys from GitHub
- Configure environment variables in Vercel dashboard
- PostgreSQL database connection required

**Frontend (Netlify)**:
- Automatically deploys from GitHub
- Configure environment variables in Netlify dashboard
- Build command: `npm run build`

## User Flow

### **Authentication Flow**
1. **Login Page**: User inputs credentials
2. **Role Check**: System determines user role from database
3. **Dashboard Routing**: 
   - `superadmin` → Superadmin Dashboard
   - All other roles → Regular User Dashboard

### **Registration Flow**
1. **Registration Form**: User provides required details
2. **Email Validation**: Only `@securemaxtech.com` emails allowed
3. **Auto-Login**: Successful registration includes automatic login
4. **Profile Setup**: Users can update profiles including password changes

### **Superadmin Features**
- **User Management**: View, edit, create, delete user accounts
- **Support Tickets**: View and resolve all user support requests
- **System Analytics**: Real-time metrics and performance data
- **System Health**: Monitor API status, database connectivity, service health

### **Regular User Features**
- **AI Agents**: Access to available AI tools and automation
- **Support System**: Create and track support tickets
- **Profile Management**: Update personal information and security settings

## API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/check` - Verify authentication status
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/profile` - Update user profile

### **CV Intelligence**
- `POST /api/cv-intelligence` - Create new CV analysis batch
- `GET /api/cv-intelligence/my-batches` - Get user's batches
- `GET /api/cv-intelligence/batches/:id` - Get batch details
- `GET /api/cv-intelligence/batches/:id/export` - Export results

### **Support System**
- `POST /api/support` - Create support ticket
- `GET /api/support/my-tickets` - Get user's tickets
- `GET /api/support` - Get all tickets (admin)
- `PUT /api/support/:id` - Update ticket status

### **Analytics** (Superadmin)
- `GET /api/analytics/dashboard` - System dashboard data
- `GET /api/analytics/users` - User analytics
- `GET /api/analytics/agents` - Agent usage statistics

## Security Features

### **Authentication & Authorization**
- JWT-based authentication with refresh tokens
- Role-based access control (user, admin, superadmin)
- Password hashing with bcrypt (12 rounds)
- Session management with automatic expiry

### **Input Validation & Sanitization**
- express-validator for request validation
- SQL injection prevention
- XSS protection
- CSRF protection via tokens

### **Rate Limiting**
- API rate limiting by IP and user
- File upload size restrictions
- Request throttling for sensitive endpoints

### **Environment Security**
- Environment variables for sensitive data
- No hardcoded secrets or passwords
- Secure cookie settings for production

## File Structure

```
/
├── backend/              # Node.js/Express API
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Authentication, validation, rate limiting
│   ├── models/          # Database models and connections
│   ├── routes/          # API route definitions
│   ├── server.js        # Application entry point
│   └── vercel.json      # Vercel deployment config
│
├── frontend/            # Next.js React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React Context providers
│   │   ├── pages/       # Next.js pages and routes
│   │   └── utils/       # API client and utilities
│   ├── public/          # Static assets
│   └── netlify.toml     # Netlify deployment config
│
└── README.md           # Documentation
```

## Database Schema

### **Users Table**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  department VARCHAR(100),
  job_title VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Support Tickets Table**
```sql
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'medium',
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **CV Processing Tables**
```sql
CREATE TABLE cv_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  status VARCHAR(50) DEFAULT 'processing',
  cv_count INTEGER DEFAULT 0,
  jd_count INTEGER DEFAULT 0,
  candidate_count INTEGER DEFAULT 0,
  processing_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cv_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES cv_batches(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  name VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(50),
  location VARCHAR(200),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  analysis_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## Support

For support and questions:
- **GitHub Issues**: [Create an issue](https://github.com/simplyarfan/simpleAI/issues)
- **Email**: syedarfan@securemaxtech.com

## License

This project is proprietary and confidential. All rights reserved.

---

**Built with ❤️ for SecureMaxTech**