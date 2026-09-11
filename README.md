# Human Unity Union - Welfare Society Management System

A comprehensive web-based management system for the Human Unity Union welfare society, deployable on Vercel with dynamic EJS frontend and a local JSON-file database.

## Features

### Admin Dashboard
- Dashboard with statistics and analytics
- User management
- Donor management with full CRUD
- Drive management
- Notification system

### Blood Donor Management
- Online donor registration
- Blood group tracking
- Medical history records
- Search and filter
- Complete donor database

### Drive Management
- Multiple drive types: Blood Donation, Plantation, Rashan, Rozgar, Ghaza, Education, Health
- Location, date, budget management
- Status tracking
- Participant tracking

### Authentication
- JWT-based signup/signin
- Role-based access (Admin, Staff, Volunteer)
- Cookie-based sessions for web interface

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: JSON file (`data/db.json`) — no external database required
- **Frontend**: EJS (dynamic HTML), Bootstrap 5, Font Awesome
- **Authentication**: JWT, bcrypt
- **Deployment**: Vercel

## Quick Deploy to Vercel

### Prerequisites
- Node.js 18+
- Vercel account
- GitHub repository

### Steps

1. **Push to GitHub**
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git remote add origin https://github.com/yourusername/huu.git
    git push -u origin main
    ```

2. **Deploy on Vercel**
    - Go to [vercel.com/new](https://vercel.com/new)
    - Import your GitHub repository
    - Vercel will auto-detect Node.js and deploy

3. **Set Environment Variables in Vercel**
    - Go to Project Settings → Environment Variables
    - Add:
      - `JWT_SECRET` - A secure random string for JWT
      - `NODE_ENV` - `production`

4. **Access the Application**
    - Your app will be live at `https://your-project.vercel.app`
    - Default admin credentials: `admin@huu.org` / `admin123`

## Local Development

1. **Install dependencies**
    ```bash
    npm install
    ```

2. **Configure environment**
    ```bash
    cp .env.example .env
    # Edit .env if needed
    ```

3. **Run the application**
    ```bash
    npm start
    ```

4. **Open browser**
    ```
    http://localhost:5000
    ```

## Database

The application uses a local JSON file (`data/db.json`) as the database.

- Seed data is included with 3 default users and sample drives
- On Vercel, data is stored in `/tmp` and persists for the lifetime of the serverless instance
- To reset data locally: `npm run seed`
- For persistent production storage, consider Vercel Blob Storage or an external JSON storage API

## Project Structure

```
HUU/
├── api/
│   └── index.js              # Vercel serverless entry point
├── server/
│   ├── config/
│   │   ├── jsonDb.js         # JSON database layer
│   │   └── seed.js           # Database seed script
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── donorController.js
│   │   ├── driveController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Donor.js
│   │   ├── Drive.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── donors.js
│   │   ├── drives.js
│   │   └── admin.js
│   └── server.js             # Main Express app
├── views/                    # EJS templates
│   ├── partials/
│   │   ├── layout.ejs
│   │   ├── navbar.ejs
│   │   └── footer.ejs
│   ├── auth/
│   │   ├── login.ejs
│   │   └── signup.ejs
│   ├── home.ejs
│   ├── donors/
│   │   ├── register.ejs
│   │   └── list.ejs
│   ├── drives/
│   │   ├── list.ejs
│   │   └── form.ejs
│   └── admin/
│       └── dashboard.ejs
├── public/
│   └── css/
│       └── style.css
├── data/
│   └── db.json               # JSON database with seed data
├── vercel.json               # Vercel configuration
├── .env.example              # Environment variables template
├── package.json
└── README.md
```

## Drive Types

- Blood Donation
- Plantation
- Rashan
- Rozgar
- Ghaza
- Education
- Health
- Other

## User Roles

- **Admin**: Full system access
- **Staff**: Manage donors, drives, notifications
- **Volunteer**: Register donors, view drives

## Security

- Password hashing with bcrypt
- JWT authentication
- HTTP-only cookies for web sessions
- Input validation
- Role-based access control

## License

Human Unity Union Welfare Society
