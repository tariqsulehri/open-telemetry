# Node.js Boilerplate

A simplified Node.js boilerplate with authentication, authorization, database integration, and modern development features.

## 🚀 Features

### Authentication & Authorization

- **JWT-based authentication** with access tokens
- **Role-based access control** (Admin/User roles)
- **Password reset** with email verification
- **OTP verification** system

### Database Support

- **MySQL** integration with connection pooling
- **MongoDB** support (optional)
- **Database migrations** and table creation

### Security Features

- **Helmet** for security headers
- **CORS** configuration
- **Password encryption** with bcrypt
- **Input validation** with Joi
- **Password policy** enforcement

### Development Features

- **Swagger/OpenAPI** documentation
- **Jest** testing framework
- **Docker** support
- **Environment configuration**
- **Logging** with Winston
- **Email service** with Nodemailer

## 📁 Project Structure

```
├── src/
│   ├── composer/           # Response composers
│   ├── config/            # Configuration files
│   │   ├── app.config.js
│   │   ├── db.mysql.js
│   │   ├── db.mongodb.js
│   ├── constants/         # Application constants
│   ├── controllers/       # Route controllers
│   ├── helpers/          # Utility functions
│   ├── middleware/        # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   │   ├── auth/         # Authentication services
│   │   ├── database/     # Database services
│   │   └── nodemailer/   # Email services
│   ├── startup/          # Application startup
│   └── validators/       # Input validation
├── views/                # EJS templates
├── docker-compose.sonar.yml
├── Dockerfile
├── package.json
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- MongoDB (optional)

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd node-js-boilerplate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp env.sample .env
   ```

   Update the `.env` file with your configuration:

   ```env
   NODE_ENV=development
   NODE_SECRET_KEY="your_jwt_private_key"
   SECRET_ACCESS_TOKEN="your_access_token_secret"
   PORT=3500

   # Database Configuration
   DB_HOST_NAME="localhost"
   DB_USER_NAME="root"
   DB_NAME="your_database"
   DB_PASSWORD="your_password"
   DB_PORT=3306

   # Email Configuration
   EMAIL_USER="your_email@gmail.com"
   EMAIL_PASS="your_app_password"
   ```

4. **Database Setup**

   - Create a MySQL database
   - The application will automatically create required tables on startup

5. **Start the application**
   ```bash
   npm start
   ```

## 🐳 Docker Support

### Using Docker Compose

```bash
docker-compose up -d
```

### Manual Docker Build

```bash
docker build -t node-boilerplate .
docker run -p 3500:3500 node-boilerplate
```

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI**: `http://localhost:3500/api-docs`
- **API Base URL**: `http://localhost:3500/api`

### Key Endpoints

#### Authentication

- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/user/change_password` - Change password
- `POST /api/user/reset_password` - Reset password
- `POST /api/user/send_otp` - Send OTP
- `POST /api/user/confirm_otp` - Confirm OTP

#### User Management

- `GET /api/user/list` - List all users (Admin only)
- `GET /api/user/getuser/:id` - Get user by ID (Admin only)
- `GET /api/user/delete/:id` - Delete user
- `GET /api/user/temporarily_delete/:id` - Soft delete user (Admin only)

## 🔧 Configuration

### Feature Toggles

The application supports feature toggles through environment variables:

```env
# Enable/disable features
ENABLE_PASSWORD_STRICTNESS_CHECK=true
```

### Password Policy

Configure password requirements:

```env
ENABLE_PASSWORD_STRICTNESS_CHECK=true
```

Default policy:

- Minimum 8 characters
- Maximum 20 characters
- Requires uppercase, lowercase, digits, and symbols
- Disallows common passwords like "admin"

## 🧪 Testing

Run tests with Jest:

```bash
npm test
```

Generate coverage report:

```bash
npm run test -- --coverage
```

## 🔒 Security Features

### Authentication Flow

1. **Registration**: Users register with email/password
2. **Login**: JWT access tokens issued
3. **Password Reset**: Email-based password recovery
4. **OTP Verification**: Email verification for new accounts

### Authorization

- **Role-based access control** (Admin/User)
- **Middleware protection** for sensitive routes
- **Token validation** on protected endpoints

## 📧 Email Services

The application includes email functionality for:

- **OTP verification** for new accounts
- **Password reset** links
- **Account notifications**

Configure email settings in `.env`:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  user_id VARCHAR(50),
  user_source VARCHAR(50) DEFAULT 'local',
  password VARCHAR(255) NOT NULL,
  role INT,
  email VARCHAR(255) NOT NULL,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Roles Table

```sql
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rolename VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  is_active TINYINT DEFAULT 1,
  created_by INT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set in production:

```env
NODE_ENV=production
PORT=3500
DB_HOST_NAME=your_production_db_host
DB_USER_NAME=your_production_db_user
DB_NAME=your_production_db_name
DB_PASSWORD=your_production_db_password
```

### Production Considerations

- Use strong JWT secrets
- Enable HTTPS
- Configure proper CORS origins
- Set up database connection pooling
- Configure proper logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Check the API documentation at `/api-docs`
- Review the test files for usage examples
- Check the configuration files for setup options

---

**Note**: This is a boilerplate project. Customize it according to your specific requirements and security needs.
