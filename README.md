# Calendar Application

A modern web application with calendar functionality featuring a public calendar view and admin panel for event management.

## Features

- 📅 **Interactive Calendar**: Beautiful calendar starting from January 1, 2025
- 👀 **Public View**: Anyone can view events and browse the calendar
- 🔐 **Admin Panel**: Secure admin interface for managing events
- 🎨 **Modern UI**: Built with Tailwind CSS for a clean, responsive design
- 🚀 **Railway Ready**: Pre-configured for Railway deployment

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React Calendar** - Interactive calendar component
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Lightweight database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

## Quick Start

### Local Development

1. **Clone and navigate to the project:**
   ```bash
   cd calendar-app
   ```

2. **Set up the backend:**
   ```bash
   cd backend
   npm install
   cp env.template .env
   npm run dev
   ```

3. **Set up the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Login: http://localhost:3000/admin

### Default Admin Credentials
- **Username:** admin
- **Password:** password

## Railway Deployment

This application is configured for Railway deployment with separate frontend and backend services.

### Deploy Backend

1. Connect your GitHub repository to Railway
2. Create a new service for the backend
3. Set the Railway configuration file to `railway-backend.json`
4. Set environment variables:
   ```
   JWT_SECRET=your-production-secret-key
   NODE_ENV=production
   ```

### Deploy Frontend

1. Create another service for the frontend
2. Set the Railway configuration file to `railway.json`
3. Set environment variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
   ```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

#### Frontend
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## API Endpoints

### Public Endpoints
- `GET /api/events` - Get all events
- `GET /api/events/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get events in date range
- `GET /health` - Health check

### Admin Endpoints (Requires Authentication)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/events` - Get all events (admin)
- `POST /api/admin/events` - Create new event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event

## Project Structure

```
calendar-app/
├── frontend/                 # Next.js frontend application
│   ├── app/
│   │   ├── admin/           # Admin panel pages
│   │   ├── globals.css      # Global styles
│   │   ├── layout.js        # Root layout
│   │   └── page.js          # Home page with calendar
│   ├── package.json
│   └── ...
├── backend/                 # Express.js backend API
│   ├── index.js            # Main server file
│   ├── package.json
│   └── env.template        # Environment variables template
├── railway.json            # Railway config for frontend
├── railway-backend.json    # Railway config for backend
├── nixpacks.toml          # Nixpacks config for frontend
├── nixpacks-backend.toml  # Nixpacks config for backend
└── README.md
```

## Database Schema

The application uses SQLite with the following tables:

### users
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `created_at` - Creation timestamp

### events
- `id` - Primary key
- `title` - Event title
- `date` - Event date (YYYY-MM-DD)
- `description` - Event description
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Features in Detail

### Public Calendar
- View events for 2025 (January 1 - December 31)
- Click on any date to see events for that day
- Visual indicators for dates with events
- Responsive design for mobile and desktop

### Admin Panel
- Secure login with JWT authentication
- Add new events with title, date, and description
- View and manage all events
- Delete events
- Session persistence with cookies

## Development Notes

- The calendar is configured to start from January 1, 2025
- Sample events are automatically created for demonstration
- Admin credentials are seeded on first run
- CORS is enabled for cross-origin requests
- Database is automatically initialized on startup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
