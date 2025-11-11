# CRUD Testing Checklist - Data Types Management

## 🎯 Pre-Testing Setup

- [ ] Máy chủ (server) đang chạy trên port 4000
- [ ] Frontend đang chạy trên port 5173 (Vite)
- [ ] Database kết nối thành công
- [ ] Đã đăng nhập bằng tài khoản Admin
- [ ] Mở DevTools (F12) để kiểm tra console

---

## 🧪 Test 1: Account Types (Loại Tài Khoản)

### 1.1 Xem Danh Sách
- [ ] Mở menu → **Loại tài khoản**
- [ ] Trang tải thành công (không có lỗi)
- [ ] Danh sách hiển thị các loại tài khoản (ít nhất 5 loại)
- [ ] Table có cột: ID, Tên Loại Tài Khoản, Thao Tác

**Expected**: Dữ liệu từ database hiển thị đúng

### 1.2 Thêm Mới
- [ ] Nhấp nút "+ Thêm loại tài khoản"
- [ ] Modal mở ra với form
- [ ] Nhập tên: "Test Type 001"
- [ ] Nhấp "Thêm"
- [ ] Thông báo: "Tạo loại tài khoản thành công"
- [ ] Item mới xuất hiện ở đầu danh sách
- [ ] Dữ liệu đúng trong database

**Expected**: ID auto-generate, tên chính xác

### 1.3 Sửa
- [ ] Nhấp nút "Sửa" trên item vừa tạo
- [ ] Modal mở ra với dữ liệu cũ
- [ ] Field ID disabled (không thể edit)
- [ ] Sửa tên thành: "Test Type Updated"
- [ ] Nhấp "Cập nhật"
- [ ] Thông báo: "Cập nhật loại tài khoản thành công"
- [ ] Danh sách cập nhật ngay lập tức

**Expected**: Tên mới hiển thị, ID không thay đổi

### 1.4 Xóa
- [ ] Nhấp nút "Xóa" trên item đã sửa
- [ ] Dialog xác nhận: "Bạn có chắc chắn muốn xóa loại tài khoản này?"
- [ ] Nhấp "OK"
- [ ] Thông báo: "Đã xóa loại tài khoản"
- [ ] Item biến mất khỏi danh sách
- [ ] Dữ liệu xóa khỏi database

**Expected**: Danh sách cập nhật, dữ liệu trong DB bị xóa

### 1.5 Validation
- [ ] Thêm mới mà không nhập tên
- [ ] Form không cho submit (button disabled hoặc không gì xảy ra)
- [ ] Nhập tên rồi submit → thành công

**Expected**: Required validation hoạt động

---

## 🧪 Test 2: Event Types (Loại Sự Kiện)

### 2.1 Xem Danh Sách
- [ ] Mở menu → **Loại sự kiện**
- [ ] Trang tải thành công
- [ ] Danh sách hiển thị (ít nhất 1 loại)
- [ ] Table có cột: ID, Tên Loại Sự Kiện, Thao Tác

**Expected**: Giống pattern Account Types

### 2.2 Thêm Mới
- [ ] Nút "+ Thêm loại sự kiện"
- [ ] Nhập: "Test Event Type"
- [ ] Nhấp "Thêm"
- [ ] Thông báo: "Tạo loại sự kiện thành công"
- [ ] Item xuất hiện trong danh sách

**Expected**: CRUD hoạt động giống Account Types

### 2.3 Sửa & Xóa
- [ ] Repeat test 1.3 và 1.4 cho Event Types
- [ ] Verify dialog confirm trước xóa

**Expected**: Hành động thành công, cập nhật ngay lập tức

---

## 🧪 Test 3: Certificate Types (Loại Chứng Nhận)

### 3.1 Xem Danh Sách
- [ ] Mở menu → **Loại chứng nhận**
- [ ] Trang tải thành công
- [ ] Danh sách hiển thị
- [ ] Table có cột: ID, Tên Loại Chứng Nhận, Thao Tác

**Expected**: Giống pattern

### 3.2 Thêm Mới
- [ ] Nút "+ Thêm loại chứng nhận"
- [ ] Nhập: "Test Certificate"
- [ ] Nhấp "Thêm"
- [ ] Verify thành công

### 3.3 Sửa & Xóa
- [ ] Test sửa và xóa như Account Types

---

## 🧪 Test 4: Support Types (Loại Hỗ Trợ)

### 4.1 Xem Danh Sách
- [ ] Mở menu → **Loại hỗ trợ**
- [ ] Trang tải thành công
- [ ] Danh sách hiển thị
- [ ] Table có cột: ID, Tên Loại Hỗ Trợ, Thao Tác

### 4.2 CRUD Operations
- [ ] Thêm mới → thành công
- [ ] Sửa → thành công
- [ ] Xóa → thành công + confirm dialog

---

## 🔐 Test 5: Security & Permissions

### 5.1 Admin Access
- [ ] Đăng nhập Admin
- [ ] Có thể truy cập tất cả 4 loại dữ liệu
- [ ] Có thể thực hiện CRUD

**Expected**: ✅ Toàn quyền

### 5.2 Non-Admin Access
- [ ] Đăng nhập với role khác (nếu có)
- [ ] Menu items không hiển thị hoặc disabled
- [ ] Nếu cố tình truy cập → 403 Forbidden hoặc redirect

**Expected**: ❌ Không có quyền

### 5.3 Token Expiration
- [ ] Đợi token hết hạn (hoặc xóa token từ localStorage)
- [ ] Cố gắng CRUD → redirect login
- [ ] Đăng nhập lại → bình thường

**Expected**: Reauth required

---

## 🌐 Test 6: API Endpoints

### 6.1 GET Endpoints
```bash
# Test GET account-types
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/account-types

# Verify 200 response
# Verify JSON array trả về
```

- [ ] GET /api/account-types → 200, array
- [ ] GET /api/event-types → 200, array
- [ ] GET /api/certificates → 200, array
- [ ] GET /api/support-types → 200, array

### 6.2 POST Endpoints
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tenLoaiTK":"Test"}' \
  http://localhost:4000/api/account-types
```

- [ ] POST account-types → 201, return object
- [ ] POST event-types → 201, return object
- [ ] POST certificates → 201, return object
- [ ] POST support-types → 201, return object

### 6.3 PUT Endpoints
```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tenLoaiTK":"Updated"}' \
  http://localhost:4000/api/account-types/1
```

- [ ] PUT account-types/:id → 200, updated object
- [ ] PUT event-types/:id → 200, updated object
- [ ] PUT certificates/:id → 200, updated object
- [ ] PUT support-types/:id → 200, updated object

### 6.4 DELETE Endpoints
```bash
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/account-types/1
```

- [ ] DELETE account-types/:id → 200, message
- [ ] DELETE event-types/:id → 200, message
- [ ] DELETE certificates/:id → 200, message
- [ ] DELETE support-types/:id → 200, message

### 6.5 Error Handling
- [ ] POST without required field → 400
- [ ] DELETE unauthorized → 403
- [ ] Invalid token → 401 (nếu có)
- [ ] Server down → error message

---

## 🎨 Test 7: UI/UX

### 7.1 Form Validation
- [ ] Required field shows asterisk (*)
- [ ] Can't submit empty form
- [ ] Error messages clear
- [ ] Modal closes after submit

### 7.2 Modal Behavior
- [ ] Modal opens smoothly
- [ ] Modal closes on "Hủy"
- [ ] Modal closes after successful action
- [ ] Modal backdrop clickable (close)

### 7.3 Table Display
- [ ] Columns align properly
- [ ] Data displays correctly
- [ ] Buttons are clickable
- [ ] Hover effects visible
- [ ] Empty state shows message

### 7.4 Loading States
- [ ] Loading indicator shows while fetching
- [ ] Button disabled while submitting
- [ ] No double-clicks possible

### 7.5 Color & Styling
- [ ] Buttons use config.primary_color
- [ ] Text color matches config.text_color
- [ ] Layout responsive
- [ ] No console errors/warnings

---

## 💾 Test 8: Data Persistence

### 8.1 Database Verification
- [ ] Check database after thêm mới
  ```sql
  SELECT * FROM loaitaikhoan;
  SELECT * FROM loaisukien;
  SELECT * FROM loaichungnhan;
  SELECT * FROM loaihotro;
  ```

### 8.2 Refresh Test
- [ ] Add new item
- [ ] Refresh page (F5)
- [ ] Data still there
- [ ] Can edit/delete it

### 8.3 Multiple Tabs
- [ ] Open same page in 2 tabs
- [ ] Add item in tab 1
- [ ] Refresh tab 2
- [ ] New item appears in tab 2

---

## ⚠️ Test 9: Error Scenarios

### 9.1 Network Errors
- [ ] Disconnect network
- [ ] Try to fetch → error message
- [ ] Reconnect → can retry

### 9.2 Server Errors
- [ ] Stop server
- [ ] Try CRUD → error message
- [ ] Start server → works again

### 9.3 Invalid Data
- [ ] Special characters in name → works
- [ ] Long text > 100 chars → works or truncates
- [ ] Empty string → validation error
- [ ] SQL injection attempt → sanitized or error

---

## 🔄 Test 10: Integration Tests

### 10.1 Cross-Table Operations
- [ ] Create account type, event type, cert type, support type
- [ ] All show up in their respective pages
- [ ] Can edit each independently
- [ ] Can delete each independently

### 10.2 User Management Integration
- [ ] Create user with specific role
- [ ] User can/cannot access type management pages
- [ ] Verify permission checking works

### 10.3 Data Relationships
- [ ] Check if deleting a type breaks any references
- [ ] Verify cascading deletes (if configured)
- [ ] Check data integrity

---

## 📝 Test Results Summary

| Test Area | Status | Notes |
|-----------|--------|-------|
| Account Types | ✅ / ❌ | |
| Event Types | ✅ / ❌ | |
| Certificate Types | ✅ / ❌ | |
| Support Types | ✅ / ❌ | |
| Security | ✅ / ❌ | |
| API Endpoints | ✅ / ❌ | |
| UI/UX | ✅ / ❌ | |
| Data Persistence | ✅ / ❌ | |
| Error Handling | ✅ / ❌ | |
| Integration | ✅ / ❌ | |

---

## 🎯 Sign-Off

- **Tested By**: ___________________
- **Date**: ___________________
- **Status**: 
  - [ ] All tests PASSED ✅
  - [ ] Some tests FAILED ❌
  - [ ] Tests BLOCKED 🚫

- **Issues Found**: 
  1. _________________________________
  2. _________________________________
  3. _________________________________

- **Notes**: 
  ___________________________________
  ___________________________________

---

**Testing Version**: 1.0  
**Last Updated**: $(date)  
**Test Coverage**: Comprehensive CRUD testing for all 4 data types
