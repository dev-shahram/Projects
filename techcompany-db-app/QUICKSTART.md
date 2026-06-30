# Quick Start Guide - TechCompanyDB Web App

## ⚡ Get Started in 5 Minutes

### Step 1: Configure Database Connection (1 minute)

Edit `backend/.env` file with your SQL Server details:

```env
DB_SERVER=localhost          # Your SQL Server name
DB_NAME=TechCompanyDB        # Your database name
DB_USER=sa                   # Your SQL username
DB_PASSWORD=YourPassword123  # Your SQL password
```

### Step 2: Install Dependencies (2 minutes)

Open terminal/command prompt in the `backend` folder:

```bash
cd backend
npm install
```

### Step 3: Start the Server (1 minute)

```bash
npm start
```

### Step 4: Open in Browser

Navigate to: **http://localhost:3000**

---

## 📁 Project Files Overview

```
techcompany-db-app/
├── backend/
│   ├── config/database.js    # Database connection settings
│   ├── .env                  # ⚠️ UPDATE THIS FILE
│   ├── package.json          # Node dependencies
│   └── server.js             # API server (all endpoints)
├── frontend/
│   ├── css/style.css         # Professional styling
│   ├── js/app.js             # Frontend logic
│   └── index.html            # Main web page
├── database/
│   └── schema.sql            # Database schema (if needed)
└── README.md                 # Full documentation
```

---

## 🔧 Common Issues & Fixes

### Issue: "Cannot connect to SQL Server"

**Fix 1:** Enable TCP/IP
1. Open SQL Server Configuration Manager
2. SQL Server Network Configuration → Protocols for MSSQLSERVER
3. Right-click TCP/IP → Enable
4. Restart SQL Server service

**Fix 2:** Try different server name
```env
# For SQL Server Express
DB_SERVER=localhost\SQLEXPRESS

# For named instance
DB_SERVER=localhost\INSTANCE_NAME
```

### Issue: "Database not found"

Run the schema script to create the database:
1. Open `database/schema.sql` in SQL Server Management Studio
2. Execute the script
3. Uncomment the sample data section (optional)

### Issue: "Port already in use"

Change the port in `.env`:
```env
PORT=3001
```

---

## 🎯 What's Included

### Pages
- ✅ **Dashboard** - Statistics overview with recent projects
- ✅ **Employees** - Manage employees with department info
- ✅ **Departments** - Manage company departments
- ✅ **Clients** - Manage client information
- ✅ **Projects** - Track projects with status and budget
- ✅ **Assignments** - Assign employees to projects

### Features
- ✅ Create, Read, Update, Delete (CRUD) for all tables
- ✅ Responsive design (mobile-friendly)
- ✅ Form validation
- ✅ Success/error notifications
- ✅ Confirmation dialogs
- ✅ Loading indicators
- ✅ Foreign key dropdowns
- ✅ Joined data display

---

## 🌐 API Endpoints

Once running, these endpoints are available:

| Endpoint | Description |
|----------|-------------|
| GET `/api/dashboard/stats` | Dashboard statistics |
| GET `/api/departments` | All departments |
| GET `/api/employees` | All employees (with dept info) |
| GET `/api/clients` | All clients |
| GET `/api/projects` | All projects (with client info) |
| GET `/api/assignments` | All assignments (with names) |

All endpoints support POST, PUT, and DELETE for CRUD operations.

---

## 🎨 Customization

### Change Colors

Edit `frontend/css/style.css`:
```css
:root {
  --primary-color: #2563eb;    /* Your brand color */
  --success-color: #10b981;    /* Success green */
  --danger-color: #ef4444;     /* Error red */
}
```

### Change Port

Edit `backend/.env`:
```env
PORT=8080
```

---

## 📞 Need Help?

1. Check the full `README.md` for detailed documentation
2. Verify SQL Server is running: `services.msc` → SQL Server
3. Test connection with SQL Server Management Studio
4. Check firewall settings for port 1433

---

**Ready to go!** 🚀 Open http://localhost:3000 and start managing your database.