# API Documentation - Data Types Management

## 📌 Base URL
```
http://localhost:4000/api
```

## 🔐 Authentication
Tất cả endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```

## 📊 Data Types Endpoints

### Account Types (Loại Tài Khoản)

#### GET /account-types
Lấy danh sách tất cả loại tài khoản

**Request**:
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/account-types
```

**Response (200)**:
```json
[
  {
    "Id_loaiTK": 1,
    "tenLoaiTK": "Admin"
  },
  {
    "Id_loaiTK": 2,
    "tenLoaiTK": "Ban Tổ Chức"
  }
]
```

---

#### POST /account-types
Tạo loại tài khoản mới

**Requirements**: Admin role (roleId = 1)

**Request**:
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tenLoaiTK":"Loại mới"}' \
  http://localhost:4000/api/account-types
```

**Body**:
```json
{
  "tenLoaiTK": "Loại mới" // Required, string
}
```

**Response (201)**:
```json
{
  "Id_loaiTK": 6,
  "tenLoaiTK": "Loại mới"
}
```

**Errors**:
- 400: Tên loại tài khoản là bắt buộc
- 403: Không có quyền truy cập (không phải Admin)
- 500: Lỗi server

---

#### PUT /account-types/:id
Cập nhật loại tài khoản

**Requirements**: Admin role

**Request**:
```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tenLoaiTK":"Tên mới"}' \
  http://localhost:4000/api/account-types/1
```

**Body**:
```json
{
  "tenLoaiTK": "Tên mới" // Required
}
```

**Response (200)**:
```json
{
  "Id_loaiTK": 1,
  "tenLoaiTK": "Tên mới"
}
```

---

#### DELETE /account-types/:id
Xóa loại tài khoản

**Requirements**: Admin role

**Request**:
```bash
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/account-types/1
```

**Response (200)**:
```json
{
  "message": "Đã xóa loại tài khoản"
}
```

---

### Event Types (Loại Sự Kiện)

#### GET /event-types
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/event-types
```

**Response**:
```json
[
  {
    "Id_LoaiSuKien": 1,
    "tenLoaiSuKien": "Cuộc thi"
  }
]
```

---

#### POST /event-types
**Body**:
```json
{
  "tenLoaiSuKien": "Loại sự kiện mới"
}
```

---

#### PUT /event-types/:id
**Body**:
```json
{
  "tenLoaiSuKien": "Tên mới"
}
```

---

#### DELETE /event-types/:id
Xóa loại sự kiện

---

### Certificates (Loại Chứng Nhận)

#### GET /certificates
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/certificates
```

**Response**:
```json
[
  {
    "Id_loaiCN": 1,
    "tenloaiCN": "Chứng chỉ hoàn thành"
  }
]
```

---

#### POST /certificates
**Body**:
```json
{
  "tenloaiCN": "Loại chứng nhận mới"
}
```

---

#### PUT /certificates/:id
**Body**:
```json
{
  "tenloaiCN": "Tên mới"
}
```

---

#### DELETE /certificates/:id
Xóa loại chứng nhận

---

### Support Types (Loại Hỗ Trợ)

#### GET /support-types
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/support-types
```

**Response**:
```json
[
  {
    "Id_LoaiHt": 1,
    "tenLoaiHt": "Hỗ trợ tư vấn"
  }
]
```

---

#### POST /support-types
**Body**:
```json
{
  "tenLoaiHt": "Loại hỗ trợ mới"
}
```

---

#### PUT /support-types/:id
**Body**:
```json
{
  "tenLoaiHt": "Tên mới"
}
```

---

#### DELETE /support-types/:id
Xóa loại hỗ trợ

---

## 🛠️ Frontend Service Usage

### JavaScript Examples

```javascript
// Import
import {
  fetchAccountTypes,
  createAccountType,
  updateAccountType,
  deleteAccountType
} from '../services/accountTypes';

// Fetch list
const types = await fetchAccountTypes();

// Create
const newType = await createAccountType({
  tenLoaiTK: 'Loại mới'
});

// Update
const updated = await updateAccountType(1, {
  tenLoaiTK: 'Tên cập nhật'
});

// Delete
await deleteAccountType(1);
```

### React Component Pattern

```jsx
import { useState, useEffect } from 'react';
import { fetchAccountTypes, createAccountType } from '../services/accountTypes';

export default function MyComponent() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchAccountTypes();
        setTypes(data || []);
      } catch (err) {
        console.error('Error:', err);
        alert('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleCreate = async (name) => {
    try {
      const newItem = await createAccountType({ tenLoaiTK: name });
      setTypes(prev => [newItem, ...prev]);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      {loading ? <p>Loading...</p> : (
        <ul>
          {types.map(t => (
            <li key={t.Id_loaiTK}>{t.tenLoaiTK}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 📋 Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Thành công |
| 201 | Created - Tạo thành công |
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 403 | Forbidden - Không có quyền |
| 404 | Not Found - Không tìm thấy |
| 500 | Server Error - Lỗi server |

---

## 🔄 Database Schema

### loaitaikhoan
```sql
CREATE TABLE loaitaikhoan (
  Id_loaiTK INT PRIMARY KEY AUTO_INCREMENT,
  tenLoaiTK VARCHAR(100) NOT NULL
);
```

### loaisukien
```sql
CREATE TABLE loaisukien (
  Id_LoaiSuKien INT PRIMARY KEY AUTO_INCREMENT,
  tenLoaiSuKien VARCHAR(100) NOT NULL
);
```

### loaichungnhan
```sql
CREATE TABLE loaichungnhan (
  Id_loaiCN INT PRIMARY KEY AUTO_INCREMENT,
  tenloaiCN VARCHAR(100) NOT NULL
);
```

### loaihotro
```sql
CREATE TABLE loaihotro (
  Id_LoaiHt INT PRIMARY KEY AUTO_INCREMENT,
  tenLoaiHt VARCHAR(100) NOT NULL
);
```

---

## ✅ Testing

### Postman Collection

```json
{
  "info": {
    "name": "Data Types API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Account Types",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/account-types",
          "host": ["{{baseUrl}}"],
          "path": ["api", "account-types"]
        }
      }
    }
  ]
}
```

---

## 🐛 Common Errors

### "Không có quyền truy cập"
- Kiểm tra token JWT
- Kiểm tra role = 1 (Admin)
- Kiểm tra token chưa hết hạn

### "Tên loại tài khoản là bắt buộc"
- Verify body chứa field "tenLoaiTK"
- Verify giá trị không rỗng

### CORS Error
- Kiểm tra server đã enable CORS
- Kiểm tra frontend origin được phép

---

## 📞 Support

Để báo cáo lỗi hoặc đề xuất, vui lòng:
1. Kiểm tra console browser (F12)
2. Kiểm tra Network tab
3. Ghi lại full error message
4. Liên hệ development team

---

**API Version**: 1.0  
**Last Updated**: $(date)  
**Status**: Production Ready
