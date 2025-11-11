# Technical Implementation Notes

## 📋 Architecture Overview

```
Frontend (React)
├── Components
│   ├── AccountTypeManagement.jsx
│   ├── EventTypeManagement.jsx
│   ├── CertificateTypeManagement.jsx
│   └── SupportTypeManagement.jsx
├── Services
│   ├── accountTypes.js
│   ├── eventTypes.js
│   ├── certificates.js
│   └── supportTypes.js
└── Hooks
    └── useApp() - Global state

Backend (Express.js)
├── Routes (server.js)
│   ├── GET /api/account-types
│   ├── POST /api/account-types
│   ├── PUT /api/account-types/:id
│   ├── DELETE /api/account-types/:id
│   └── ... (same pattern for other types)
├── Middleware
│   ├── auth - JWT verification
│   └── role check - Admin only
└── Database (MySQL)
    ├── loaitaikhoan
    ├── loaisukien
    ├── loaichungnhan
    └── loaihotro
```

---

## 🔧 Implementation Details

### 1. Component Structure

All components follow this pattern:

```jsx
import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import Modal from './Modal';
import { fetchX, createX, updateX, deleteX } from '../services/x';

export default function Component() {
  const { state } = useApp();
  const { config } = state;
  
  // State
  const [types, setTypes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ Id: '', name: '' });
  
  // Lifecycle
  useEffect(() => {
    loadTypes();
  }, []);
  
  // Methods
  const loadTypes = async () => { /* fetch */ };
  const openCreate = () => { /* init form */ };
  const openEdit = (item) => { /* populate form */ };
  const handleSave = async (e) => { /* create/update */ };
  const handleDelete = async (item) => { /* delete */ };
  
  // Render
  return (
    <div>
      {/* Header with button */}
      {/* Table with items */}
      {/* Modal with form */}
    </div>
  );
}
```

### 2. Service Layer Pattern

Each service follows this pattern:

```javascript
import { apiFetch } from './api';

export async function fetchX() {
  return apiFetch('/api/endpoint');
}

export async function createX(data) {
  return apiFetch('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateX(id, data) {
  return apiFetch(`/api/endpoint/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteX(id) {
  return apiFetch(`/api/endpoint/${id}`, {
    method: 'DELETE'
  });
}
```

### 3. Backend Route Pattern

Each CRUD set follows this pattern:

```javascript
// GET - List all
app.get('/api/endpoint', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM table');
    res.json(rows || []);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST - Create
app.post('/api/endpoint', auth, async (req, res) => {
  try {
    if (![1].includes(Number(req.user.roleId))) {
      return res.status(403).json({ message: 'Không có quyền' });
    }
    
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên là bắt buộc' });
    
    const [result] = await pool.execute(
      'INSERT INTO table (name) VALUES (?)',
      [name]
    );
    const [rows] = await pool.execute(
      'SELECT * FROM table WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT - Update
app.put('/api/endpoint/:id', auth, async (req, res) => {
  try {
    if (![1].includes(Number(req.user.roleId))) {
      return res.status(403).json({ message: 'Không có quyền' });
    }
    
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên là bắt buộc' });
    
    await pool.execute(
      'UPDATE table SET name = ? WHERE id = ?',
      [name, id]
    );
    const [rows] = await pool.execute(
      'SELECT * FROM table WHERE id = ?',
      [id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE - Delete
app.delete('/api/endpoint/:id', auth, async (req, res) => {
  try {
    if (![1].includes(Number(req.user.roleId))) {
      return res.status(403).json({ message: 'Không có quyền' });
    }
    
    const { id } = req.params;
    await pool.execute('DELETE FROM table WHERE id = ?', [id]);
    
    res.json({ message: 'Đã xóa' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
```

---

## 🔐 Security Measures

### 1. Authentication
- ✅ JWT token required (auth middleware)
- ✅ Token verified before processing
- ✅ Token included in service layer automatically via apiFetch

### 2. Authorization
- ✅ Role-based access control
- ✅ Only Admin (roleId = 1) can modify data
- ✅ Read-only users can still fetch (if needed, can be restricted)

### 3. Input Validation
- ✅ Required fields checked
- ✅ Type checking in backend
- ✅ SQL injection prevented via prepared statements
- ✅ Frontend validation via HTML5 required attribute

### 4. Error Handling
- ✅ Proper HTTP status codes
- ✅ Generic error messages (don't expose internals)
- ✅ Console logging for debugging
- ✅ User-friendly error messages

---

## 🗄️ Database Schema

### Field Naming Convention

| Entity | Table Name | ID Field | Name Field |
|--------|-----------|----------|-----------|
| Account Type | `loaitaikhoan` | `Id_loaiTK` | `tenLoaiTK` |
| Event Type | `loaisukien` | `Id_LoaiSuKien` | `tenLoaiSuKien` |
| Certificate | `loaichungnhan` | `Id_loaiCN` | `tenloaiCN` |
| Support Type | `loaihotro` | `Id_LoaiHt` | `tenLoaiHt` |

### Sample Data

```sql
-- loaitaikhoan
INSERT INTO loaitaikhoan (Id_loaiTK, tenLoaiTK) VALUES
(1, 'Admin'),
(2, 'Ban Tổ Chức'),
(3, 'Cán Bộ Lớp'),
(4, 'Sinh Viên'),
(5, 'Giám Khảo');

-- loaisukien
INSERT INTO loaisukien (Id_LoaiSuKien, tenLoaiSuKien) VALUES
(1, 'Cuộc thi'),
(2, 'Hội thảo'),
(3, 'Khoá học');

-- loaichungnhan
INSERT INTO loaichungnhan (Id_loaiCN, tenloaiCN) VALUES
(1, 'Chứng chỉ hoàn thành'),
(2, 'Chứng chỉ xuất sắc'),
(3, 'Huy hiệu tham gia');

-- loaihotro
INSERT INTO loaihotro (Id_LoaiHt, tenLoaiHt) VALUES
(1, 'Hỗ trợ tư vấn'),
(2, 'Hỗ trợ tài chính'),
(3, 'Hỗ trợ kỹ thuật');
```

---

## 🎯 State Management

### Component-Level State

```javascript
const [types, setTypes] = useState([]);           // List of items
const [editing, setEditing] = useState(null);     // Currently edited item
const [showModal, setShowModal] = useState(false);// Modal visibility
const [loading, setLoading] = useState(false);    // API call loading
const [form, setForm] = useState({                // Form data
  Id_loaiTK: '',
  tenLoaiTK: ''
});
```

### Global State (useApp)

```javascript
// From AppContext
const { state } = useApp();
const { config } = state;

// Available config
config.primary_color    // Button color
config.text_color       // Text color
config.background_color // Background color
config.system_title     // System name
```

### API State Management

```javascript
// Automatic via apiFetch
- Includes auth token
- Handles response parsing
- Handles errors
```

---

## 🔄 Data Flow

### GET Flow
```
Component → loadTypes() → fetchX() → apiFetch() → GET /api/x → 
  Backend → Database → Response → setTypes()
```

### POST Flow
```
Component → handleSave() → createX() → apiFetch() → POST /api/x → 
  Backend → Validate → Database INSERT → Response → 
  setTypes(prev => [newItem, ...prev])
```

### PUT Flow
```
Component → handleSave() (edit) → updateX() → apiFetch() → PUT /api/x/:id → 
  Backend → Validate → Database UPDATE → Response → 
  setTypes(prev => prev.map(...))
```

### DELETE Flow
```
Component → handleDelete() → confirm() → deleteX() → apiFetch() → 
  DELETE /api/x/:id → Backend → Database DELETE → Response → 
  setTypes(prev => prev.filter(...))
```

---

## 📦 Dependencies

### Frontend
```json
{
  "react": "^18.x",
  "react-dom": "^18.x"
}
```

### Backend
```json
{
  "express": "^4.x",
  "jsonwebtoken": "^9.x",
  "cors": "^2.x",
  "mysql2": "^3.x",
  "dotenv": "^16.x"
}
```

---

## 🚀 Performance Considerations

1. **List Loading**
   - [ ] Consider pagination for large lists
   - [ ] Add search/filter functionality
   - [ ] Implement lazy loading

2. **API Calls**
   - [ ] Implement caching (React Query, SWR)
   - [ ] Debounce search inputs
   - [ ] Cancel in-flight requests on unmount

3. **UI Rendering**
   - [ ] Use React.memo for list items
   - [ ] Implement virtual scrolling for long lists
   - [ ] Optimize modal re-renders

4. **Database**
   - [ ] Add indexes on frequently queried columns
   - [ ] Consider denormalization if needed
   - [ ] Implement query optimization

---

## 🐛 Debugging Tips

### Frontend Debug
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Check React Profiler for performance

### Backend Debug
1. Check `console.error()` logs
2. Check database directly:
   ```sql
   SELECT * FROM loaitaikhoan;
   ```
3. Use Postman to test API endpoints
4. Check JWT token validity

### Common Issues

| Issue | Solution |
|-------|----------|
| "403 Forbidden" | Check user role is Admin (roleId = 1) |
| "400 Bad Request" | Check required fields in request body |
| No data displays | Check network tab for 200 response |
| Modal doesn't close | Check form submission success |
| Can't edit | Check if ID field is passed correctly |

---

## 🔄 Maintenance Checklist

- [ ] Regular database backups
- [ ] Monitor error logs
- [ ] Keep dependencies updated
- [ ] Test after updates
- [ ] Document schema changes
- [ ] Review security regularly
- [ ] Optimize slow queries
- [ ] Clean up unused code

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Guide](https://jwt.io/introduction)
- [RESTful API Best Practices](https://restfulapi.net/)

---

## 📞 Support & Troubleshooting

If you encounter issues:

1. **Check Logs**
   - Frontend: Browser DevTools Console
   - Backend: Terminal output

2. **Verify Setup**
   - Database connection string
   - JWT secret key
   - CORS configuration
   - Port numbers

3. **Test Components**
   - Use Postman for API testing
   - Check React DevTools for state
   - Verify database data with SQL client

4. **Common Fixes**
   - Restart server and frontend
   - Clear browser cache (Ctrl+Shift+Del)
   - Check firewall settings
   - Verify database is running

---

**Document Version**: 1.0  
**Last Updated**: $(date)  
**Status**: Complete & Tested
