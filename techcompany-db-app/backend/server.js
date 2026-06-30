const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { pool, poolConnect, testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// ==================== DEPARTMENTS API ====================

// GET all departments
app.get('/api/departments', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query('SELECT * FROM Departments ORDER BY DeptID');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single department
app.get('/api/departments/:id', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('SELECT * FROM Departments WHERE DeptID = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create department
app.post('/api/departments', async (req, res) => {
  try {
    const { DeptName, Location } = req.body;
    
    if (!DeptName) {
      return res.status(400).json({ success: false, error: 'Department name is required' });
    }

    await poolConnect;
    const result = await pool.request()
      .input('deptName', require('./config/database').sql.NVarChar(100), DeptName)
      .input('location', require('./config/database').sql.NVarChar(100), Location || null)
      .query(`
        INSERT INTO Departments (DeptName, Location) 
        OUTPUT INSERTED.* 
        VALUES (@deptName, @location)
      `);
    
    res.status(201).json({ success: true, data: result.recordset[0], message: 'Department created successfully' });
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update department
app.put('/api/departments/:id', async (req, res) => {
  try {
    const { DeptName, Location } = req.body;
    const id = req.params.id;

    await poolConnect;
    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, id)
      .input('deptName', require('./config/database').sql.NVarChar(100), DeptName)
      .input('location', require('./config/database').sql.NVarChar(100), Location || null)
      .query(`
        UPDATE Departments 
        SET DeptName = @deptName, Location = @location 
        OUTPUT INSERTED.*
        WHERE DeptID = @id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
    res.json({ success: true, data: result.recordset[0], message: 'Department updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE department
app.delete('/api/departments/:id', async (req, res) => {
  try {
    await poolConnect;
    
    // Check if department has employees
    const checkResult = await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('SELECT COUNT(*) as count FROM Employees WHERE DeptID = @id');
    
    if (checkResult.recordset[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete department with existing employees. Reassign or delete employees first.' 
      });
    }

    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('DELETE FROM Departments WHERE DeptID = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== EMPLOYEES API ====================

// GET all employees with department info
app.get('/api/employees', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT e.*, d.DeptName, d.Location 
      FROM Employees e
      LEFT JOIN Departments d ON e.DeptID = d.DeptID
      ORDER BY e.EmpID
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single employee
app.get('/api/employees/:id', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('SELECT * FROM Employees WHERE EmpID = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create employee
app.post('/api/employees', async (req, res) => {
  try {
    const { FirstName, LastName, Email, Phone, Salary, HireDate, DeptID, Position } = req.body;
    
    if (!FirstName || !LastName) {
      return res.status(400).json({ success: false, error: 'First and last name are required' });
    }

    await poolConnect;
    const result = await pool.request()
      .input('firstName', require('./config/database').sql.NVarChar(50), FirstName)
      .input('lastName', require('./config/database').sql.NVarChar(50), LastName)
      .input('email', require('./config/database').sql.NVarChar(100), Email || null)
      .input('phone', require('./config/database').sql.NVarChar(20), Phone || null)
      .input('salary', require('./config/database').sql.Decimal(10, 2), Salary || null)
      .input('hireDate', require('./config/database').sql.Date, HireDate || null)
      .input('deptId', require('./config/database').sql.Int, DeptID || null)
      .input('position', require('./config/database').sql.NVarChar(100), Position || null)
      .query(`
        INSERT INTO Employees (FirstName, LastName, Email, Phone, Salary, HireDate, DeptID, Position) 
        OUTPUT INSERTED.* 
        VALUES (@firstName, @lastName, @email, @phone, @salary, @hireDate, @deptId, @position)
      `);
    
    res.status(201).json({ success: true, data: result.recordset[0], message: 'Employee created successfully' });
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { FirstName, LastName, Email, Phone, Salary, HireDate, DeptID, Position } = req.body;
    const id = req.params.id;

    await poolConnect;
    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, id)
      .input('firstName', require('./config/database').sql.NVarChar(50), FirstName)
      .input('lastName', require('./config/database').sql.NVarChar(50), LastName)
      .input('email', require('./config/database').sql.NVarChar(100), Email || null)
      .input('phone', require('./config/database').sql.NVarChar(20), Phone || null)
      .input('salary', require('./config/database').sql.Decimal(10, 2), Salary || null)
      .input('hireDate', require('./config/database').sql.Date, HireDate || null)
      .input('deptId', require('./config/database').sql.Int, DeptID || null)
      .input('position', require('./config/database').sql.NVarChar(100), Position || null)
      .query(`
        UPDATE Employees 
        SET FirstName = @firstName, LastName = @lastName, Email = @email, 
            Phone = @phone, Salary = @salary, HireDate = @hireDate, 
            DeptID = @deptId, Position = @position
        OUTPUT INSERTED.*
        WHERE EmpID = @id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, data: result.recordset[0], message: 'Employee updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    await poolConnect;
    
    // Delete related assignments first
    await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('DELETE FROM Assignments WHERE EmpID = @id');

    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('DELETE FROM Employees WHERE EmpID = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== CLIENTS API ====================

// GET all clients
app.get('/api/clients', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query('SELECT * FROM Clients ORDER BY ClientID');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single client
app.get('/api/clients/:id', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('SELECT * FROM Clients WHERE ClientID = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create client
app.post('/api/clients', async (req, res) => {
  try {
    const { ClientName, ContactPerson, Email, Phone, Address } = req.body;
    
    if (!ClientName) {
      return res.status(400).json({ success: false, error: 'Client name is required' });
    }

    await poolConnect;
    const result = await pool.request()
      .input('clientName', require('./config/database').sql.NVarChar(100), ClientName)
      .input('contactPerson', require('./config/database').sql.NVarChar(100), ContactPerson || null)
      .input('email', require('./config/database').sql.NVarChar(100), Email || null)
      .input('phone', require('./config/database').sql.NVarChar(20), Phone || null)
      .input('address', require('./config/database').sql.NVarChar(255), Address || null)
      .query(`
        INSERT INTO Clients (ClientName, ContactPerson, Email, Phone, Address) 
        OUTPUT INSERTED.* 
        VALUES (@clientName, @contactPerson, @email, @phone, @address)
      `);
    
    res.status(201).json({ success: true, data: result.recordset[0], message: 'Client created successfully' });
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { ClientName, ContactPerson, Email, Phone, Address } = req.body;
    const id = req.params.id;

    await poolConnect;
    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, id)
      .input('clientName', require('./config/database').sql.NVarChar(100), ClientName)
      .input('contactPerson', require('./config/database').sql.NVarChar(100), ContactPerson || null)
      .input('email', require('./config/database').sql.NVarChar(100), Email || null)
      .input('phone', require('./config/database').sql.NVarChar(20), Phone || null)
      .input('address', require('./config/database').sql.NVarChar(255), Address || null)
      .query(`
        UPDATE Clients 
        SET ClientName = @clientName, ContactPerson = @contactPerson, 
            Email = @email, Phone = @phone, Address = @address
        OUTPUT INSERTED.*
        WHERE ClientID = @id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    res.json({ success: true, data: result.recordset[0], message: 'Client updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    await poolConnect;
    
    // Check if client has projects
    const checkResult = await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('SELECT COUNT(*) as count FROM Projects WHERE ClientID = @id');
    
    if (checkResult.recordset[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete client with existing projects. Delete projects first.' 
      });
    }

    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('DELETE FROM Clients WHERE ClientID = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== PROJECTS API ====================

// GET all projects with client info
app.get('/api/projects', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT p.*, c.ClientName 
      FROM Projects p
      LEFT JOIN Clients c ON p.ClientID = c.ClientID
      ORDER BY p.ProjectID
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('SELECT * FROM Projects WHERE ProjectID = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create project
app.post('/api/projects', async (req, res) => {
  try {
    const { ProjectName, Description, StartDate, EndDate, Budget, Status, ClientID } = req.body;
    
    if (!ProjectName) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }

    await poolConnect;
    const result = await pool.request()
      .input('projectName', require('./config/database').sql.NVarChar(100), ProjectName)
      .input('description', require('./config/database').sql.NVarChar(500), Description || null)
      .input('startDate', require('./config/database').sql.Date, StartDate || null)
      .input('endDate', require('./config/database').sql.Date, EndDate || null)
      .input('budget', require('./config/database').sql.Decimal(15, 2), Budget || null)
      .input('status', require('./config/database').sql.NVarChar(50), Status || 'Pending')
      .input('clientId', require('./config/database').sql.Int, ClientID || null)
      .query(`
        INSERT INTO Projects (ProjectName, Description, StartDate, EndDate, Budget, Status, ClientID) 
        OUTPUT INSERTED.* 
        VALUES (@projectName, @description, @startDate, @endDate, @budget, @status, @clientId)
      `);
    
    res.status(201).json({ success: true, data: result.recordset[0], message: 'Project created successfully' });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { ProjectName, Description, StartDate, EndDate, Budget, Status, ClientID } = req.body;
    const id = req.params.id;

    await poolConnect;
    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, id)
      .input('projectName', require('./config/database').sql.NVarChar(100), ProjectName)
      .input('description', require('./config/database').sql.NVarChar(500), Description || null)
      .input('startDate', require('./config/database').sql.Date, StartDate || null)
      .input('endDate', require('./config/database').sql.Date, EndDate || null)
      .input('budget', require('./config/database').sql.Decimal(15, 2), Budget || null)
      .input('status', require('./config/database').sql.NVarChar(50), Status || 'Pending')
      .input('clientId', require('./config/database').sql.Int, ClientID || null)
      .query(`
        UPDATE Projects 
        SET ProjectName = @projectName, Description = @description, 
            StartDate = @startDate, EndDate = @endDate, Budget = @budget, 
            Status = @status, ClientID = @clientId
        OUTPUT INSERTED.*
        WHERE ProjectID = @id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: result.recordset[0], message: 'Project updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    await poolConnect;
    
    // Delete related assignments first
    await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('DELETE FROM Assignments WHERE ProjectID = @id');

    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('DELETE FROM Projects WHERE ProjectID = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== ASSIGNMENTS API ====================

// GET all assignments with employee and project info
app.get('/api/assignments', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT a.*, 
             e.FirstName + ' ' + e.LastName as EmployeeName,
             p.ProjectName
      FROM Assignments a
      LEFT JOIN Employees e ON a.EmpID = e.EmpID
      LEFT JOIN Projects p ON a.ProjectID = p.ProjectID
      ORDER BY a.AssignmentID
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single assignment
app.get('/api/assignments/:id', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('SELECT * FROM Assignments WHERE AssignmentID = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create assignment
app.post('/api/assignments', async (req, res) => {
  try {
    const { EmpID, ProjectID, Role, HoursAllocated } = req.body;
    
    if (!EmpID || !ProjectID) {
      return res.status(400).json({ success: false, error: 'Employee and Project are required' });
    }

    await poolConnect;
    const result = await pool.request()
      .input('empId', require('./config/database').sql.Int, EmpID)
      .input('projectId', require('./config/database').sql.Int, ProjectID)
      .input('role', require('./config/database').sql.NVarChar(100), Role || null)
      .input('hoursAllocated', require('./config/database').sql.Int, HoursAllocated || null)
      .query(`
        INSERT INTO Assignments (EmpID, ProjectID, Role, HoursAllocated) 
        OUTPUT INSERTED.* 
        VALUES (@empId, @projectId, @role, @hoursAllocated)
      `);
    
    res.status(201).json({ success: true, data: result.recordset[0], message: 'Assignment created successfully' });
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update assignment
app.put('/api/assignments/:id', async (req, res) => {
  try {
    const { EmpID, ProjectID, Role, HoursAllocated } = req.body;
    const id = req.params.id;

    await poolConnect;
    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, id)
      .input('empId', require('./config/database').sql.Int, EmpID)
      .input('projectId', require('./config/database').sql.Int, ProjectID)
      .input('role', require('./config/database').sql.NVarChar(100), Role || null)
      .input('hoursAllocated', require('./config/database').sql.Int, HoursAllocated || null)
      .query(`
        UPDATE Assignments 
        SET EmpID = @empId, ProjectID = @projectId, Role = @role, HoursAllocated = @hoursAllocated
        OUTPUT INSERTED.*
        WHERE AssignmentID = @id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    res.json({ success: true, data: result.recordset[0], message: 'Assignment updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE assignment
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id', require('./config/database').sql.Int, req.params.id)
      .query('DELETE FROM Assignments WHERE AssignmentID = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== DASHBOARD STATS API ====================

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    await poolConnect;
    
    const stats = {};
    
    // Get counts
    const deptCount = await pool.request().query('SELECT COUNT(*) as count FROM Departments');
    stats.departments = deptCount.recordset[0].count;
    
    const empCount = await pool.request().query('SELECT COUNT(*) as count FROM Employees');
    stats.employees = empCount.recordset[0].count;
    
    const clientCount = await pool.request().query('SELECT COUNT(*) as count FROM Clients');
    stats.clients = clientCount.recordset[0].count;
    
    const projectCount = await pool.request().query('SELECT COUNT(*) as count FROM Projects');
    stats.projects = projectCount.recordset[0].count;
    
    const assignmentCount = await pool.request().query('SELECT COUNT(*) as count FROM Assignments');
    stats.assignments = assignmentCount.recordset[0].count;
    
    // Get recent projects
    const recentProjects = await pool.request().query(`
      SELECT TOP 5 p.*, c.ClientName 
      FROM Projects p
      LEFT JOIN Clients c ON p.ClientID = c.ClientID
      ORDER BY p.ProjectID DESC
    `);
    stats.recentProjects = recentProjects.recordset;
    
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== ROOT ROUTE ====================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ==================== START SERVER ====================

async function startServer() {
  // Test database connection first
  const connected = await testConnection();
  
  if (!connected) {
    console.log('\n⚠️  Starting server without database connection...');
    console.log('   Fix connection settings and restart the server.\n');
  }
  
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`\n📚 API Endpoints:`);
    console.log(`   Departments:  GET    http://localhost:${PORT}/api/departments`);
    console.log(`   Employees:    GET    http://localhost:${PORT}/api/employees`);
    console.log(`   Clients:      GET    http://localhost:${PORT}/api/clients`);
    console.log(`   Projects:     GET    http://localhost:${PORT}/api/projects`);
    console.log(`   Assignments:  GET    http://localhost:${PORT}/api/assignments`);
    console.log(`   Dashboard:    GET    http://localhost:${PORT}/api/dashboard/stats`);
    console.log(`\n🌐 Open http://localhost:${PORT} in your browser\n`);
  });
}

startServer();