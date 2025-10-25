// API Configuration
const API_BASE = window.location.origin + '/api';
let authToken = localStorage.getItem('adminToken');
let currentPage = { users: 1, books: 1 };
let searchTerm = { users: '', books: '' };
let filterStatus = { users: 'all', books: 'all' };

// Check if already logged in
if (authToken) {
    verifyToken();
} else {
    showLogin();
}

// ==================== AUTH ====================

async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            showDashboard();
            loadStats();
            loadUsers();
        } else {
            showLogin();
        }
    } catch (error) {
        showLogin();
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            
            // Verify it's an admin
            const verifyResponse = await fetch(`${API_BASE}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (verifyResponse.ok) {
                showDashboard();
                loadStats();
                loadUsers();
            } else {
                showError('You do not have admin privileges');
                logout();
            }
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (error) {
        showError('Connection error. Please try again.');
    }
});

function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function logout() {
    authToken = null;
    localStorage.removeItem('adminToken');
    showLogin();
}

// ==================== STATS ====================

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const stats = await response.json();
        
        // Update UI
        document.getElementById('totalUsers').textContent = stats.users.total;
        document.getElementById('activeUsers').textContent = stats.users.active;
        document.getElementById('inactiveUsers').textContent = stats.users.inactive;
        
        document.getElementById('totalBooks').textContent = stats.books.total;
        document.getElementById('activeBooks').textContent = stats.books.active;
        document.getElementById('closedBooks').textContent = stats.books.closed;
        
        document.getElementById('totalEntries').textContent = stats.entries.total;
        document.getElementById('signedEntries').textContent = stats.entries.signed;
        document.getElementById('pendingEntries').textContent = stats.entries.pending;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ==================== USERS ====================

async function loadUsers(page = 1) {
    currentPage.users = page;
    
    try {
        const response = await fetch(
            `${API_BASE}/admin/users?page=${page}&limit=20&search=${searchTerm.users}&status=${filterStatus.users}`,
            { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        
        const data = await response.json();
        
        renderUsersTable(data.users);
        renderPagination('users', data.pagination);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function renderUsersTable(users) {
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Books</th>
                    <th>Shared</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td><strong>${user.username}</strong></td>
                        <td>${user.full_name}</td>
                        <td>${user.book_count}</td>
                        <td>${user.shared_book_count}</td>
                        <td>
                            <span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-warning'}">
                                ${user.status}
                            </span>
                        </td>
                        <td>${new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="viewUser(${user.id})">View</button>
                            <button class="btn btn-sm ${user.status === 'active' ? 'btn-danger' : 'btn-success'}" 
                                    onclick="toggleUserStatus(${user.id}, '${user.status}')">
                                ${user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('usersTable').innerHTML = tableHTML;
}

async function viewUser(userId) {
    try {
        const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        const modalContent = `
            <h2>👤 User Details</h2>
            <div style="margin: 20px 0;">
                <p><strong>ID:</strong> ${data.user.id}</p>
                <p><strong>Username:</strong> ${data.user.username}</p>
                <p><strong>Full Name:</strong> ${data.user.full_name}</p>
                <p><strong>Language:</strong> ${data.user.preferred_language}</p>
                <p><strong>Status:</strong> <span class="badge ${data.user.status === 'active' ? 'badge-success' : 'badge-warning'}">${data.user.status}</span></p>
                <p><strong>Created:</strong> ${new Date(data.user.created_at).toLocaleString()}</p>
            </div>
            
            <h3>📚 Owned Books (${data.ownedBooks.length})</h3>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>D.L.No</th>
                        <th>Amount</th>
                        <th>Entries</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.ownedBooks.map(book => `
                        <tr>
                            <td>${book.name}</td>
                            <td>${book.dl_no || '-'}</td>
                            <td>₹${book.loan_amount}</td>
                            <td>${book.entry_count}</td>
                            <td><span class="badge ${book.status === 'active' ? 'badge-success' : 'badge-warning'}">${book.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h3 style="margin-top: 20px;">🤝 Shared Books (${data.sharedBooks.length})</h3>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Owner</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.sharedBooks.map(book => `
                        <tr>
                            <td>${book.name}</td>
                            <td>${book.owner_name} (@${book.owner_username})</td>
                            <td>₹${book.loan_amount}</td>
                            <td><span class="badge ${book.status === 'active' ? 'badge-success' : 'badge-warning'}">${book.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('modalContent').innerHTML = modalContent;
        document.getElementById('detailsModal').classList.add('show');
    } catch (error) {
        alert('Error loading user details');
    }
}

async function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    if (!confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this user?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            loadUsers(currentPage.users);
            loadStats();
        } else {
            alert('Error updating user status');
        }
    } catch (error) {
        alert('Connection error');
    }
}

function searchUsers() {
    searchTerm.users = document.getElementById('userSearch').value;
    loadUsers(1);
}

function filterUsers() {
    filterStatus.users = document.getElementById('userStatusFilter').value;
    loadUsers(1);
}

// ==================== BOOKS ====================

async function loadBooks(page = 1) {
    currentPage.books = page;
    
    try {
        const response = await fetch(
            `${API_BASE}/admin/books?page=${page}&limit=20&search=${searchTerm.books}&status=${filterStatus.books}`,
            { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        
        const data = await response.json();
        
        renderBooksTable(data.books);
        renderPagination('books', data.pagination);
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

function renderBooksTable(books) {
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>D.L.No</th>
                    <th>Name</th>
                    <th>Owner</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Entries</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${books.map(book => {
                    const balance = book.loan_amount - (book.total_paid || 0);
                    return `
                        <tr>
                            <td>${book.dl_no || '-'}</td>
                            <td><strong>${book.name}</strong></td>
                            <td>${book.owner_name}<br><small>@${book.owner_username}</small></td>
                            <td>₹${book.loan_amount.toFixed(2)}</td>
                            <td>₹${(book.total_paid || 0).toFixed(2)}</td>
                            <td>₹${balance.toFixed(2)}</td>
                            <td>${book.entry_count}</td>
                            <td>
                                <span class="badge ${book.status === 'active' ? 'badge-success' : 'badge-warning'}">
                                    ${book.status}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewBook('${book.id}')">View</button>
                                <button class="btn btn-sm ${book.status === 'active' ? 'btn-danger' : 'btn-success'}" 
                                        onclick="toggleBookStatus('${book.id}', '${book.status}')">
                                    ${book.status === 'active' ? 'Close' : 'Reopen'}
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('booksTable').innerHTML = tableHTML;
}

async function viewBook(bookId) {
    try {
        const response = await fetch(`${API_BASE}/admin/books/${bookId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        const balance = data.book.loan_amount - data.entries.reduce((sum, e) => sum + (e.amount || 0), 0);
        
        const modalContent = `
            <h2>📚 Book Details</h2>
            <div style="margin: 20px 0;">
                <p><strong>D.L.No:</strong> ${data.book.dl_no || '-'}</p>
                <p><strong>Name:</strong> ${data.book.name}</p>
                <p><strong>Father Name:</strong> ${data.book.father_name || '-'}</p>
                <p><strong>Address:</strong> ${data.book.address || '-'}</p>
                <p><strong>Owner:</strong> ${data.book.owner_name} (@${data.book.owner_username})</p>
                <p><strong>Loan Amount:</strong> ₹${data.book.loan_amount}</p>
                <p><strong>Balance:</strong> ₹${balance.toFixed(2)}</p>
                <p><strong>Period:</strong> ${data.book.start_date || '-'} to ${data.book.end_date || '-'}</p>
                <p><strong>Status:</strong> <span class="badge ${data.book.status === 'active' ? 'badge-success' : 'badge-warning'}">${data.book.status}</span></p>
                <p><strong>Created:</strong> ${new Date(data.book.created_at).toLocaleString()}</p>
            </div>
            
            <h3>📝 Entries (${data.entries.length})</h3>
            <div style="max-height: 300px; overflow-y: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Balance</th>
                            <th>Signature</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.entries.map(entry => `
                            <tr>
                                <td>${entry.serial_number}</td>
                                <td>${entry.date || '-'}</td>
                                <td>₹${(entry.amount || 0).toFixed(2)}</td>
                                <td>₹${(entry.remaining || 0).toFixed(2)}</td>
                                <td><span class="badge badge-info">${entry.signature_status || 'none'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <h3 style="margin-top: 20px;">🤝 Shared With (${data.shares.length})</h3>
            <ul>
                ${data.shares.map(share => `
                    <li>${share.full_name} (@${share.username})</li>
                `).join('') || '<li>Not shared with anyone</li>'}
            </ul>
        `;
        
        document.getElementById('modalContent').innerHTML = modalContent;
        document.getElementById('detailsModal').classList.add('show');
    } catch (error) {
        alert('Error loading book details');
    }
}

async function toggleBookStatus(bookId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    
    if (!confirm(`Are you sure you want to ${newStatus === 'active' ? 'reopen' : 'close'} this book?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/books/${bookId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            loadBooks(currentPage.books);
            loadStats();
        } else {
            alert('Error updating book status');
        }
    } catch (error) {
        alert('Connection error');
    }
}

function searchBooks() {
    searchTerm.books = document.getElementById('bookSearch').value;
    loadBooks(1);
}

function filterBooks() {
    filterStatus.books = document.getElementById('bookStatusFilter').value;
    loadBooks(1);
}

// ==================== UI ====================

function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide content
    if (tab === 'users') {
        document.getElementById('usersTab').classList.remove('hidden');
        document.getElementById('booksTab').classList.add('hidden');
        loadUsers();
    } else if (tab === 'books') {
        document.getElementById('usersTab').classList.add('hidden');
        document.getElementById('booksTab').classList.remove('hidden');
        loadBooks();
    }
}

function renderPagination(type, pagination) {
    let html = '';
    
    // Previous button
    html += `<button ${pagination.page === 1 ? 'disabled' : ''} onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}(${pagination.page - 1})">← Previous</button>`;
    
    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === 1 || i === pagination.totalPages || (i >= pagination.page - 2 && i <= pagination.page + 2)) {
            html += `<button class="${i === pagination.page ? 'active' : ''}" onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}(${i})">${i}</button>`;
        } else if (i === pagination.page - 3 || i === pagination.page + 3) {
            html += '<span>...</span>';
        }
    }
    
    // Next button
    html += `<button ${pagination.page === pagination.totalPages ? 'disabled' : ''} onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}(${pagination.page + 1})">Next →</button>`;
    
    document.getElementById(`${type}Pagination`).innerHTML = html;
}

function closeModal() {
    document.getElementById('detailsModal').classList.remove('show');
}

// Close modal on outside click
document.getElementById('detailsModal').addEventListener('click', (e) => {
    if (e.target.id === 'detailsModal') {
        closeModal();
    }
});

