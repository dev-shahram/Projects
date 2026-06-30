// ==================== CONFIGURATION ====================
const API_BASE_URL = window.location.origin; // Automatically detect the server URL

// ==================== STATE MANAGEMENT ====================
let currentPage = 'dashboard';
let departments = [];
let employees = [];
let clients = [];
let projects = [];
let assignments = [];

// ==================== UTILITY FUNCTIONS ====================

// Show alert message
function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alertContainer');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  alertContainer.appendChild(alert);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Format currency
function formatCurrency(amount) {
  if (!amount) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Show loading state
function showLoading() {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loadingOverlay';
  overlay.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(overlay);
}

// Hide loading state
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.remove();
}

// ==================== API FUNCTIONS ====================

// Generic API call
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'An error occurred');
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Fetch all data
async function fetchDashboardStats() {
  try {
    const result = await apiCall('/api/dashboard/stats');
    if (result.success) {
      document.getElementById('statEmployees').textContent = result.data.employees;
      document.getElementById('statDepartments').textContent = result.data.departments;
      document.getElementById('statClients').textContent = result.data.clients;
      document.getElementById('statProjects').textContent = result.data.projects;
      document.getElementById('statAssignments').textContent = result.data.assignments;
      
      // Render recent projects
      renderRecentProjects(result.data.recentProjects);
    }
  } catch (error) {
    showAlert('Failed to load dashboard stats: ' + error.message, 'error');
  }
}

async function fetchDepartments() {
  try {
    const result = await apiCall('/api/departments');
    if (result.success) {
      departments = result.data;
      renderDepartmentsTable();
      populateDepartmentDropdowns();
    }
  } catch (error) {
    showAlert('Failed to load departments: ' + error.message, 'error');
  }
}

async function fetchEmployees() {
  try {
    const result = await apiCall('/api/employees');
    if (result.success) {
      employees = result.data;
      renderEmployeesTable();
      populateEmployeeDropdowns();
    }
  } catch (error) {
    showAlert('Failed to load employees: ' + error.message, 'error');
  }
}

async function fetchClients() {
  try {
    const result = await apiCall('/api/clients');
    if (result.success) {
      clients = result.data;
      renderClientsTable();
      populateClientDropdowns();
    }
  } catch (error) {
    showAlert('Failed to load clients: ' + error.message, 'error');
  }
}

async function fetchProjects() {
  try {
    const result = await apiCall('/api/projects');
    if (result.success) {
      projects = result.data;
      renderProjectsTable();
      populateProjectDropdowns();
    }
  } catch (error) {
    showAlert('Failed to load projects: ' + error.message, 'error');
  }
}

async function fetchAssignments() {
  try {
    const result = await apiCall('/api/assignments');
    if (result.success) {
      assignments = result.data;
      renderAssignmentsTable();
    }
  } catch (error) {
    showAlert('Failed to load assignments: ' + error.message, 'error');
  }
}

// ==================== RENDER FUNCTIONS ====================

function renderRecentProjects(recentProjects) {
  const tbody = document.querySelector('#recentProjectsTable tbody');
  if (!recentProjects || recentProjects.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No recent projects</td></tr>';
    return;
  }
  
  tbody.innerHTML = recentProjects.map(project => `
    <tr>
      <td>${project.ProjectID}</td>
      <td>${project.ProjectName}</td>
      <td>${project.ClientName || '-'}</td>
      <td><span class="status-badge status-${project.Status?.toLowerCase().replace(' ', '-')}">${project.Status}</span></td>
      <td>${formatCurrency(project.Budget)}</td>
    </tr>
  `).join('');
}

function renderDepartmentsTable() {
  const tbody = document.querySelector('#departmentsTable tbody');
  if (departments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No departments found</td></tr>';
    return;
  }
  
  tbody.innerHTML = departments.map(dept => `
    <tr>
      <td>${dept.DeptID}</td>
      <td>${dept.DeptName}</td>
      <td>${dept.Location || '-'}</td>
      <td class="table-actions">
        <button class="btn-edit" onclick="editDepartment(${dept.DeptID})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-delete" onclick="deleteDepartment(${dept.DeptID})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
}

function renderEmployeesTable() {
  const tbody = document.querySelector('#employeesTable tbody');
  if (employees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No employees found</td></tr>';
    return;
  }
  
  tbody.innerHTML = employees.map(emp => `
    <tr>
      <td>${emp.EmpID}</td>
      <td>${emp.FirstName} ${emp.LastName}</td>
      <td>${emp.Email || '-'}</td>
      <td>${emp.Phone || '-'}</td>
      <td>${emp.Position || '-'}</td>
      <td>${emp.DeptName || '-'}</td>
      <td>${formatCurrency(emp.Salary)}</td>
      <td>${formatDate(emp.HireDate)}</td>
      <td class="table-actions">
        <button class="btn-edit" onclick="editEmployee(${emp.EmpID})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-delete" onclick="deleteEmployee(${emp.EmpID})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
}

function renderClientsTable() {
  const tbody = document.querySelector('#clientsTable tbody');
  if (clients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No clients found</td></tr>';
    return;
  }
  
  tbody.innerHTML = clients.map(client => `
    <tr>
      <td>${client.ClientID}</td>
      <td>${client.ClientName}</td>
      <td>${client.ContactPerson || '-'}</td>
      <td>${client.Email || '-'}</td>
      <td>${client.Phone || '-'}</td>
      <td>${client.Address || '-'}</td>
      <td class="table-actions">
        <button class="btn-edit" onclick="editClient(${client.ClientID})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-delete" onclick="deleteClient(${client.ClientID})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
}

function renderProjectsTable() {
  const tbody = document.querySelector('#projectsTable tbody');
  if (projects.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No projects found</td></tr>';
    return;
  }
  
  tbody.innerHTML = projects.map(project => `
    <tr>
      <td>${project.ProjectID}</td>
      <td>${project.ProjectName}</td>
      <td>${project.ClientName || '-'}</td>
      <td>${formatDate(project.StartDate)}</td>
      <td>${formatDate(project.EndDate)}</td>
      <td>${formatCurrency(project.Budget)}</td>
      <td><span class="status-badge status-${project.Status?.toLowerCase().replace(' ', '-')}">${project.Status}</span></td>
      <td class="table-actions">
        <button class="btn-edit" onclick="editProject(${project.ProjectID})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-delete" onclick="deleteProject(${project.ProjectID})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
}

function renderAssignmentsTable() {
  const tbody = document.querySelector('#assignmentsTable tbody');
  if (assignments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No assignments found</td></tr>';
    return;
  }
  
  tbody.innerHTML = assignments.map(assign => `
    <tr>
      <td>${assign.AssignmentID}</td>
      <td>${assign.EmployeeName || '-'}</td>
      <td>${assign.ProjectName || '-'}</td>
      <td>${assign.Role || '-'}</td>
      <td>${assign.HoursAllocated || '-'}</td>
      <td class="table-actions">
        <button class="btn-edit" onclick="editAssignment(${assign.AssignmentID})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-delete" onclick="deleteAssignment(${assign.AssignmentID})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
}

// ==================== DROPDOWN POPULATION ====================

function populateDepartmentDropdowns() {
  const selects = document.querySelectorAll('#empDept');
  selects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Select Department --</option>';
    departments.forEach(dept => {
      select.innerHTML += `<option value="${dept.DeptID}">${dept.DeptName}</option>`;
    });
    select.value = currentValue;
  });
}

function populateEmployeeDropdowns() {
  const selects = document.querySelectorAll('#assignEmployee');
  selects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Select Employee --</option>';
    employees.forEach(emp => {
      select.innerHTML += `<option value="${emp.EmpID}">${emp.FirstName} ${emp.LastName}</option>`;
    });
    select.value = currentValue;
  });
}

function populateClientDropdowns() {
  const selects = document.querySelectorAll('#projectClient');
  selects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Select Client --</option>';
    clients.forEach(client => {
      select.innerHTML += `<option value="${client.ClientID}">${client.ClientName}</option>`;
    });
    select.value = currentValue;
  });
}

function populateProjectDropdowns() {
  const selects = document.querySelectorAll('#assignProject');
  selects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Select Project --</option>';
    projects.forEach(project => {
      select.innerHTML += `<option value="${project.ProjectID}">${project.ProjectName}</option>`;
    });
    select.value = currentValue;
  });
}

// ==================== MODAL FUNCTIONS ====================

function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  document.body.style.overflow = '';
  
  // Reset form if exists
  const form = document.querySelector(`#${modalId} form`);
  if (form) {
    form.reset();
    form.querySelectorAll('input[type="hidden"]').forEach(input => input.value = '');
  }
}

// Close modal on outside click
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ==================== CRUD OPERATIONS ====================

// ---------- DEPARTMENTS ----------

document.getElementById('departmentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading();
  
  const id = document.getElementById('departmentId').value;
  const data = {
    DeptName: document.getElementById('deptName').value,
    Location: document.getElementById('deptLocation').value
  };
  
  try {
    if (id) {
      await apiCall(`/api/departments/${id}`, 'PUT', data);
      showAlert('Department updated successfully');
    } else {
      await apiCall('/api/departments', 'POST', data);
      showAlert('Department created successfully');
    }
    closeModal('departmentModal');
    await fetchDepartments();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    hideLoading();
  }
});

async function editDepartment(id) {
  const dept = departments.find(d => d.DeptID === id);
  if (!dept) return;
  
  document.getElementById('departmentId').value = dept.DeptID;
  document.getElementById('deptName').value = dept.DeptName;
  document.getElementById('deptLocation').value = dept.Location || '';
  document.getElementById('departmentModalTitle').textContent = 'Edit Department';
  
  openModal('departmentModal');
}

function deleteDepartment(id) {
  document.getElementById('deleteId').value = id;
  document.getElementById('deleteType').value = 'department';
  openModal('deleteModal');
}

// ---------- EMPLOYEES ----------

document.getElementById('employeeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading();
  
  const id = document.getElementById('employeeId').value;
  const data = {
    FirstName: document.getElementById('empFirstName').value,
    LastName: document.getElementById('empLastName').value,
    Email: document.getElementById('empEmail').value,
    Phone: document.getElementById('empPhone').value,
    Position: document.getElementById('empPosition').value,
    DeptID: document.getElementById('empDept').value,
    Salary: document.getElementById('empSalary').value,
    HireDate: document.getElementById('empHireDate').value
  };
  
  try {
    if (id) {
      await apiCall(`/api/employees/${id}`, 'PUT', data);
      showAlert('Employee updated successfully');
    } else {
      await apiCall('/api/employees', 'POST', data);
      showAlert('Employee created successfully');
    }
    closeModal('employeeModal');
    await fetchEmployees();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    hideLoading();
  }
});

async function editEmployee(id) {
  const emp = employees.find(e => e.EmpID === id);
  if (!emp) return;
  
  document.getElementById('employeeId').value = emp.EmpID;
  document.getElementById('empFirstName').value = emp.FirstName;
  document.getElementById('empLastName').value = emp.LastName;
  document.getElementById('empEmail').value = emp.Email || '';
  document.getElementById('empPhone').value = emp.Phone || '';
  document.getElementById('empPosition').value = emp.Position || '';
  document.getElementById('empDept').value = emp.DeptID || '';
  document.getElementById('empSalary').value = emp.Salary || '';
  document.getElementById('empHireDate').value = emp.HireDate ? emp.HireDate.split('T')[0] : '';
  document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
  
  openModal('employeeModal');
}

function deleteEmployee(id) {
  document.getElementById('deleteId').value = id;
  document.getElementById('deleteType').value = 'employee';
  openModal('deleteModal');
}

// ---------- CLIENTS ----------

document.getElementById('clientForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading();
  
  const id = document.getElementById('clientId').value;
  const data = {
    ClientName: document.getElementById('clientName').value,
    ContactPerson: document.getElementById('clientContact').value,
    Email: document.getElementById('clientEmail').value,
    Phone: document.getElementById('clientPhone').value,
    Address: document.getElementById('clientAddress').value
  };
  
  try {
    if (id) {
      await apiCall(`/api/clients/${id}`, 'PUT', data);
      showAlert('Client updated successfully');
    } else {
      await apiCall('/api/clients', 'POST', data);
      showAlert('Client created successfully');
    }
    closeModal('clientModal');
    await fetchClients();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    hideLoading();
  }
});

async function editClient(id) {
  const client = clients.find(c => c.ClientID === id);
  if (!client) return;
  
  document.getElementById('clientId').value = client.ClientID;
  document.getElementById('clientName').value = client.ClientName;
  document.getElementById('clientContact').value = client.ContactPerson || '';
  document.getElementById('clientEmail').value = client.Email || '';
  document.getElementById('clientPhone').value = client.Phone || '';
  document.getElementById('clientAddress').value = client.Address || '';
  document.getElementById('clientModalTitle').textContent = 'Edit Client';
  
  openModal('clientModal');
}

function deleteClient(id) {
  document.getElementById('deleteId').value = id;
  document.getElementById('deleteType').value = 'client';
  openModal('deleteModal');
}

// ---------- PROJECTS ----------

document.getElementById('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading();
  
  const id = document.getElementById('projectId').value;
  const data = {
    ProjectName: document.getElementById('projectName').value,
    Description: document.getElementById('projectDescription').value,
    ClientID: document.getElementById('projectClient').value,
    Status: document.getElementById('projectStatus').value,
    StartDate: document.getElementById('projectStartDate').value,
    EndDate: document.getElementById('projectEndDate').value,
    Budget: document.getElementById('projectBudget').value
  };
  
  try {
    if (id) {
      await apiCall(`/api/projects/${id}`, 'PUT', data);
      showAlert('Project updated successfully');
    } else {
      await apiCall('/api/projects', 'POST', data);
      showAlert('Project created successfully');
    }
    closeModal('projectModal');
    await fetchProjects();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    hideLoading();
  }
});

async function editProject(id) {
  const project = projects.find(p => p.ProjectID === id);
  if (!project) return;
  
  document.getElementById('projectId').value = project.ProjectID;
  document.getElementById('projectName').value = project.ProjectName;
  document.getElementById('projectDescription').value = project.Description || '';
  document.getElementById('projectClient').value = project.ClientID || '';
  document.getElementById('projectStatus').value = project.Status || 'Pending';
  document.getElementById('projectStartDate').value = project.StartDate ? project.StartDate.split('T')[0] : '';
  document.getElementById('projectEndDate').value = project.EndDate ? project.EndDate.split('T')[0] : '';
  document.getElementById('projectBudget').value = project.Budget || '';
  document.getElementById('projectModalTitle').textContent = 'Edit Project';
  
  openModal('projectModal');
}

function deleteProject(id) {
  document.getElementById('deleteId').value = id;
  document.getElementById('deleteType').value = 'project';
  openModal('deleteModal');
}

// ---------- ASSIGNMENTS ----------

document.getElementById('assignmentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading();
  
  const id = document.getElementById('assignmentId').value;
  const data = {
    EmpID: document.getElementById('assignEmployee').value,
    ProjectID: document.getElementById('assignProject').value,
    Role: document.getElementById('assignRole').value,
    HoursAllocated: document.getElementById('assignHours').value
  };
  
  try {
    if (id) {
      await apiCall(`/api/assignments/${id}`, 'PUT', data);
      showAlert('Assignment updated successfully');
    } else {
      await apiCall('/api/assignments', 'POST', data);
      showAlert('Assignment created successfully');
    }
    closeModal('assignmentModal');
    await fetchAssignments();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    hideLoading();
  }
});

async function editAssignment(id) {
  const assign = assignments.find(a => a.AssignmentID === id);
  if (!assign) return;
  
  document.getElementById('assignmentId').value = assign.AssignmentID;
  document.getElementById('assignEmployee').value = assign.EmpID;
  document.getElementById('assignProject').value = assign.ProjectID;
  document.getElementById('assignRole').value = assign.Role || '';
  document.getElementById('assignHours').value = assign.HoursAllocated || '';
  document.getElementById('assignmentModalTitle').textContent = 'Edit Assignment';
  
  openModal('assignmentModal');
}

function deleteAssignment(id) {
  document.getElementById('deleteId').value = id;
  document.getElementById('deleteType').value = 'assignment';
  openModal('deleteModal');
}

// ---------- DELETE CONFIRMATION ----------

async function confirmDelete() {
  const id = document.getElementById('deleteId').value;
  const type = document.getElementById('deleteType').value;
  
  showLoading();
  
  try {
    switch (type) {
      case 'department':
        await apiCall(`/api/departments/${id}`, 'DELETE');
        await fetchDepartments();
        break;
      case 'employee':
        await apiCall(`/api/employees/${id}`, 'DELETE');
        await fetchEmployees();
        break;
      case 'client':
        await apiCall(`/api/clients/${id}`, 'DELETE');
        await fetchClients();
        break;
      case 'project':
        await apiCall(`/api/projects/${id}`, 'DELETE');
        await fetchProjects();
        break;
      case 'assignment':
        await apiCall(`/api/assignments/${id}`, 'DELETE');
        await fetchAssignments();
        break;
    }
    showAlert('Record deleted successfully');
    closeModal('deleteModal');
  } catch (error) {
    showAlert(error.message, 'error');
    closeModal('deleteModal');
  } finally {
    hideLoading();
  }
}

// ==================== NAVIGATION ====================

function switchPage(pageName) {
  // Update sidebar active state
  document.querySelectorAll('.nav-links li').forEach(li => {
    li.classList.remove('active');
    if (li.dataset.page === pageName) {
      li.classList.add('active');
    }
  });
  
  // Update page visibility
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageName).classList.add('active');
  
  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    employees: 'Employees',
    departments: 'Departments',
    clients: 'Clients',
    projects: 'Projects',
    assignments: 'Assignments'
  };
  document.getElementById('pageTitle').textContent = titles[pageName];
  
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('active');
  
  currentPage = pageName;
  
  // Load data for the page
  loadPageData(pageName);
}

async function loadPageData(pageName) {
  showLoading();
  try {
    switch (pageName) {
      case 'dashboard':
        await fetchDashboardStats();
        break;
      case 'employees':
        await Promise.all([fetchDepartments(), fetchEmployees()]);
        break;
      case 'departments':
        await fetchDepartments();
        break;
      case 'clients':
        await fetchClients();
        break;
      case 'projects':
        await Promise.all([fetchClients(), fetchProjects()]);
        break;
      case 'assignments':
        await Promise.all([fetchEmployees(), fetchProjects(), fetchAssignments()]);
        break;
    }
  } catch (error) {
    showAlert('Error loading data: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

// ==================== EVENT LISTENERS ====================

// Navigation links
document.querySelectorAll('.nav-links li').forEach(li => {
  li.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(li.dataset.page);
  });
});

// Mobile menu toggle
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('active');
});

// Refresh button
document.getElementById('refreshBtn').addEventListener('click', () => {
  loadPageData(currentPage);
});

// Reset modal titles when opening
document.querySelectorAll('[onclick^="openModal"]').forEach(btn => {
  btn.addEventListener('click', function() {
    const modalId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
    const titleEl = document.querySelector(`#${modalId} h2`);
    if (titleEl && titleEl.id) {
      const entity = titleEl.id.replace('ModalTitle', '');
      titleEl.textContent = `Add ${entity.charAt(0).toUpperCase() + entity.slice(1)}`;
    }
  });
});

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  // Load initial data
  loadPageData('dashboard');
});