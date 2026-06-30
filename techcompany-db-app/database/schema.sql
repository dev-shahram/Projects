-- =====================================================
-- TechCompanyDB Schema Creation Script
-- =====================================================
-- Run this script in SQL Server Management Studio (SSMS)
-- or Azure Data Studio to create the database and tables
-- =====================================================

-- Create the database (if it doesn't exist)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'TechCompanyDB')
BEGIN
    CREATE DATABASE TechCompanyDB;
    PRINT 'Database TechCompanyDB created successfully.';
END
ELSE
BEGIN
    PRINT 'Database TechCompanyDB already exists.';
END
GO

-- Use the database
USE TechCompanyDB;
GO

-- =====================================================
-- Create Departments Table
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Departments')
BEGIN
    CREATE TABLE Departments (
        DeptID INT PRIMARY KEY IDENTITY(1,1),
        DeptName NVARCHAR(100) NOT NULL,
        Location NVARCHAR(100) NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table Departments created successfully.';
END
ELSE
BEGIN
    PRINT 'Table Departments already exists.';
END
GO

-- =====================================================
-- Create Employees Table
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Employees')
BEGIN
    CREATE TABLE Employees (
        EmpID INT PRIMARY KEY IDENTITY(1,1),
        FirstName NVARCHAR(50) NOT NULL,
        LastName NVARCHAR(50) NOT NULL,
        Email NVARCHAR(100) NULL,
        Phone NVARCHAR(20) NULL,
        Salary DECIMAL(10,2) NULL,
        HireDate DATE NULL,
        DeptID INT NULL,
        Position NVARCHAR(100) NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_Employees_Departments 
            FOREIGN KEY (DeptID) REFERENCES Departments(DeptID)
            ON DELETE SET NULL
            ON UPDATE CASCADE
    );
    PRINT 'Table Employees created successfully.';
END
ELSE
BEGIN
    PRINT 'Table Employees already exists.';
END
GO

-- =====================================================
-- Create Clients Table
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Clients')
BEGIN
    CREATE TABLE Clients (
        ClientID INT PRIMARY KEY IDENTITY(1,1),
        ClientName NVARCHAR(100) NOT NULL,
        ContactPerson NVARCHAR(100) NULL,
        Email NVARCHAR(100) NULL,
        Phone NVARCHAR(20) NULL,
        Address NVARCHAR(255) NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table Clients created successfully.';
END
ELSE
BEGIN
    PRINT 'Table Clients already exists.';
END
GO

-- =====================================================
-- Create Projects Table
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Projects')
BEGIN
    CREATE TABLE Projects (
        ProjectID INT PRIMARY KEY IDENTITY(1,1),
        ProjectName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        StartDate DATE NULL,
        EndDate DATE NULL,
        Budget DECIMAL(15,2) NULL,
        Status NVARCHAR(50) DEFAULT 'Pending',
        ClientID INT NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_Projects_Clients 
            FOREIGN KEY (ClientID) REFERENCES Clients(ClientID)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT CHK_ProjectStatus 
            CHECK (Status IN ('Pending', 'In Progress', 'Completed', 'On Hold'))
    );
    PRINT 'Table Projects created successfully.';
END
ELSE
BEGIN
    PRINT 'Table Projects already exists.';
END
GO

-- =====================================================
-- Create Assignments Table (Employee-Project Junction)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Assignments')
BEGIN
    CREATE TABLE Assignments (
        AssignmentID INT PRIMARY KEY IDENTITY(1,1),
        EmpID INT NOT NULL,
        ProjectID INT NOT NULL,
        Role NVARCHAR(100) NULL,
        HoursAllocated INT NULL,
        AssignedDate DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_Assignments_Employees 
            FOREIGN KEY (EmpID) REFERENCES Employees(EmpID)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
        CONSTRAINT FK_Assignments_Projects 
            FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
        CONSTRAINT UQ_Assignment UNIQUE (EmpID, ProjectID)
    );
    PRINT 'Table Assignments created successfully.';
END
ELSE
BEGIN
    PRINT 'Table Assignments already exists.';
END
GO

-- =====================================================
-- Create Indexes for Better Performance
-- =====================================================

-- Index on Employees.DepptID for faster joins
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Employees_DeptID')
BEGIN
    CREATE INDEX IX_Employees_DeptID ON Employees(DeptID);
    PRINT 'Index IX_Employees_DeptID created.';
END
GO

-- Index on Projects.ClientID for faster joins
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Projects_ClientID')
BEGIN
    CREATE INDEX IX_Projects_ClientID ON Projects(ClientID);
    PRINT 'Index IX_Projects_ClientID created.';
END
GO

-- Index on Assignments for faster lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Assignments_EmpID')
BEGIN
    CREATE INDEX IX_Assignments_EmpID ON Assignments(EmpID);
    PRINT 'Index IX_Assignments_EmpID created.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Assignments_ProjectID')
BEGIN
    CREATE INDEX IX_Assignments_ProjectID ON Assignments(ProjectID);
    PRINT 'Index IX_Assignments_ProjectID created.';
END
GO

-- =====================================================
-- Insert Sample Data (Optional)
-- =====================================================

-- Uncomment the following sections if you want to insert sample data

/*
-- Sample Departments
INSERT INTO Departments (DeptName, Location) VALUES
('Engineering', 'Building A, Floor 3'),
('Human Resources', 'Building B, Floor 1'),
('Sales', 'Building A, Floor 2'),
('Marketing', 'Building B, Floor 2'),
('Finance', 'Building C, Floor 1');

-- Sample Employees
INSERT INTO Employees (FirstName, LastName, Email, Phone, Salary, HireDate, DeptID, Position) VALUES
('John', 'Smith', 'john.smith@techcompany.com', '555-0101', 85000.00, '2020-01-15', 1, 'Senior Developer'),
('Sarah', 'Johnson', 'sarah.j@techcompany.com', '555-0102', 75000.00, '2021-03-20', 1, 'Developer'),
('Michael', 'Brown', 'michael.b@techcompany.com', '555-0103', 65000.00, '2022-06-10', 2, 'HR Manager'),
('Emily', 'Davis', 'emily.d@techcompany.com', '555-0104', 70000.00, '2021-08-05', 3, 'Sales Representative'),
('David', 'Wilson', 'david.w@techcompany.com', '555-0105', 90000.00, '2019-11-12', 1, 'Tech Lead'),
('Lisa', 'Anderson', 'lisa.a@techcompany.com', '555-0106', 60000.00, '2023-01-10', 4, 'Marketing Specialist'),
('Robert', 'Taylor', 'robert.t@techcompany.com', '555-0107', 80000.00, '2020-09-15', 5, 'Finance Manager');

-- Sample Clients
INSERT INTO Clients (ClientName, ContactPerson, Email, Phone, Address) VALUES
('Acme Corporation', 'Jane Doe', 'jane.doe@acme.com', '555-1001', '123 Business Ave, New York, NY'),
('TechStart Inc', 'Bob Johnson', 'bob@techstart.io', '555-1002', '456 Innovation Dr, San Francisco, CA'),
('Global Solutions', 'Maria Garcia', 'maria@globalsol.com', '555-1003', '789 Enterprise St, Chicago, IL'),
('Digital Dynamics', 'Chris Lee', 'chris@digitaldyn.com', '555-1004', '321 Tech Blvd, Austin, TX');

-- Sample Projects
INSERT INTO Projects (ProjectName, Description, StartDate, EndDate, Budget, Status, ClientID) VALUES
('Website Redesign', 'Complete overhaul of company website', '2024-01-15', '2024-04-30', 50000.00, 'In Progress', 1),
('Mobile App Development', 'iOS and Android app for client', '2024-02-01', '2024-08-31', 120000.00, 'In Progress', 2),
('Database Migration', 'Migrate legacy database to SQL Server', '2024-03-01', '2024-05-15', 35000.00, 'Pending', 3),
('E-commerce Platform', 'Build online store solution', '2023-10-01', '2024-03-31', 85000.00, 'Completed', 4),
('Cloud Infrastructure', 'Setup AWS cloud infrastructure', '2024-01-01', '2024-06-30', 150000.00, 'In Progress', 1);

-- Sample Assignments
INSERT INTO Assignments (EmpID, ProjectID, Role, HoursAllocated) VALUES
(1, 1, 'Lead Developer', 160),
(2, 1, 'Frontend Developer', 120),
(1, 2, 'Technical Architect', 80),
(5, 2, 'Project Manager', 200),
(2, 3, 'Database Specialist', 160),
(4, 4, 'Business Analyst', 100),
(6, 4, 'Marketing Consultant', 60),
(5, 5, 'Cloud Architect', 180);

PRINT 'Sample data inserted successfully.';
*/

PRINT '';
PRINT '=====================================================';
PRINT 'TechCompanyDB Schema Setup Complete!';
PRINT '=====================================================';
PRINT '';
PRINT 'Tables created:';
PRINT '  - Departments';
PRINT '  - Employees';
PRINT '  - Clients';
PRINT '  - Projects';
PRINT '  - Assignments';
PRINT '';
PRINT 'Next steps:';
PRINT '  1. Update the .env file with your SQL Server credentials';
PRINT '  2. Run: npm install (in the backend folder)';
PRINT '  3. Run: npm start (to start the server)';
PRINT '  4. Open http://localhost:3000 in your browser';
PRINT '=====================================================';
GO