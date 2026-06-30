# TechCompanyDB - Database Management System

A complete full-stack web application for managing the TechCompanyDB SQL Server database. This application provides a modern, responsive web interface to perform CRUD operations on all database tables.

## 📋 Features

### Core Functionality
- **Dashboard** - Overview with statistics and recent projects
- **Employees Management** - Add, view, edit, and delete employees
- **Departments Management** - Manage company departments
- **Clients Management** - Handle client information
- **Projects Management** - Track projects with status and budget
- **Assignments** - Assign employees to projects

### Technical Features
- ✅ Full CRUD operations for all tables
- ✅ Responsive design (works on desktop, tablet, and mobile)
- ✅ Form validation
- ✅ Success and error notifications
- ✅ Joined data display (Employee with Department, Project with Client, etc.)
- ✅ Foreign key dropdowns
- ✅ Loading indicators
- ✅ Confirmation dialogs for deletions
- ✅ RESTful API architecture
- ✅ Parameterized queries (SQL injection protection)

## 🏗️ Project Structure

```
techcompany-db-app/
├── backend/
│   ├── config/
│   │   └── database.js       # SQL Server connection configuration
│   ├── .env                  # Environment variables (update this!)
│   ├── package.json          # Node.js dependencies
│   └── server.js             # Main Express server with API endpoints
├── frontend/
│   ├── css/
│   │   └── style.css         # Modern responsive styling
│   ├── js/
│   │   └── app.js            # Frontend JavaScript logic
│   └── index.html            # Main HTML page
└── README.md                 # This file
```

