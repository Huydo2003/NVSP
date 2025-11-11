# Hướng Dẫn Sử Dụng Chức Năng Quản Lý Loại Dữ Liệu

## 🎯 Giới Thiệu
Bạn có thể quản lý 4 loại dữ liệu tham chiếu trong hệ thống:
1. **Loại Tài Khoản** - Xác định các loại vai trò người dùng
2. **Loại Sự Kiện** - Phân loại các sự kiện
3. **Loại Chứng Nhận** - Loại chứng chỉ cấp cho người dùng
4. **Loại Hỗ Trợ** - Các hình thức hỗ trợ có sẵn

---

## 📖 Hướng Dẫn Từng Chức Năng

### 1️⃣ Loại Tài Khoản

#### Truy cập
- Đăng nhập với vai trò **Admin**
- Menu bên trái → **Loại tài khoản**

#### Chức năng
| Chức Năng | Cách Thực Hiện |
|-----------|---------------|
| **Xem danh sách** | Tự động tải khi mở trang |
| **Thêm mới** | Nút "+ Thêm loại tài khoản" → Điền form → "Thêm" |
| **Sửa** | Nút "Sửa" trên hàng → Chỉnh sửa → "Cập nhật" |
| **Xóa** | Nút "Xóa" trên hàng → Xác nhận → Xóa |

#### Form Fields
- **ID** (Auto-generated, disabled khi edit)
- **Tên Loại Tài Khoản** (Bắt buộc)

#### Ví Dụ
```
ID: 1, Tên: Admin
ID: 2, Tên: Ban Tổ Chức
ID: 3, Tên: Cán Bộ Lớp
ID: 4, Tên: Sinh Viên
ID: 5, Tên: Giám Khảo
```

---

### 2️⃣ Loại Sự Kiện

#### Truy cập
- Đăng nhập với vai trò **Admin**
- Menu bên trái → **Loại sự kiện**

#### Chức năng
Giống như Loại Tài Khoản:
- Xem danh sách, Thêm mới, Sửa, Xóa

#### Form Fields
- **ID** (Auto-generated)
- **Tên Loại Sự Kiện** (Bắt buộc)

#### Ví Dụ
```
ID: 1, Tên: Cuộc thi
ID: 2, Tên: Hội thảo
ID: 3, Tên: Khoá học
```

---

### 3️⃣ Loại Chứng Nhận

#### Truy cập
- Đăng nhập với vai trò **Admin**
- Menu bên trái → **Loại chứng nhận**

#### Chức năng
Giống như trên:
- Xem danh sách, Thêm mới, Sửa, Xóa

#### Form Fields
- **ID** (Auto-generated)
- **Tên Loại Chứng Nhận** (Bắt buộc)

#### Ví Dụ
```
ID: 1, Tên: Chứng chỉ hoàn thành
ID: 2, Tên: Chứng chỉ xuất sắc
ID: 3, Tên: Huy hiệu tham gia
```

---

### 4️⃣ Loại Hỗ Trợ

#### Truy cập
- Đăng nhập với vai trò **Admin**
- Menu bên trái → **Loại hỗ trợ**

#### Chức năng
Giống như trên:
- Xem danh sách, Thêm mới, Sửa, Xóa

#### Form Fields
- **ID** (Auto-generated)
- **Tên Loại Hỗ Trợ** (Bắt buộc)

#### Ví Dụ
```
ID: 1, Tên: Hỗ trợ tư vấn
ID: 2, Tên: Hỗ trợ tài chính
ID: 3, Tên: Hỗ trợ kỹ thuật
```

---

## 🎨 Giao Diện Chung

Tất cả các trang quản lý loại dữ liệu có cấu trúc giống nhau:

```
┌─────────────────────────────────────────────┐
│  📌 Tiêu đề              [+ Thêm mới]       │
├─────────────────────────────────────────────┤
│  ID  │ Tên                │ Thao Tác        │
├─────────────────────────────────────────────┤
│  1   │ Tên mục 1          │ [Sửa] [Xóa]    │
│  2   │ Tên mục 2          │ [Sửa] [Xóa]    │
└─────────────────────────────────────────────┘
```

---

## ⚡ Hành Động Nhanh

### Thêm Mới
1. Nhấp nút "+ Thêm"
2. Trong Modal:
   - Nhập tên (bắt buộc)
   - Nhấp "Thêm"
3. Xác nhận: "Tạo [loại] thành công"

### Sửa
1. Nhấp nút "Sửa" trên hàng
2. Trong Modal:
   - ID được disable (không chỉnh sửa)
   - Sửa tên nếu cần
   - Nhấp "Cập nhật"
3. Xác nhận: "Cập nhật [loại] thành công"

### Xóa
1. Nhấp nút "Xóa" trên hàng
2. Xác nhận: "Bạn có chắc chắn muốn xóa loại này?"
3. Click OK để xóa
4. Xác nhận: "Đã xóa loại"

---

## ⚠️ Lưu Ý Quan Trọng

✅ **Có thể làm**:
- Thêm loại mới bất kỳ lúc nào
- Sửa tên loại hiện tại
- Xóa loại không được sử dụng

❌ **Không nên**:
- Xóa các loại mặc định (1-5 cho Account Types)
- Xóa loại đang được sử dụng trong dữ liệu khác

---

## 🔐 Quyền Truy Cập

| Vai trò | Xem | Thêm | Sửa | Xóa |
|---------|-----|------|-----|-----|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Ban Tổ Chức | ❌ | ❌ | ❌ | ❌ |
| Cán Bộ Lớp | ❌ | ❌ | ❌ | ❌ |
| Sinh Viên | ❌ | ❌ | ❌ | ❌ |
| Giám Khảo | ❌ | ❌ | ❌ | ❌ |

**Chỉ Admin mới có quyền truy cập các chức năng này**

---

## 🐛 Troubleshooting

### Lỗi: "Không thể tải danh sách"
- **Nguyên nhân**: Server không chạy hoặc mất kết nối
- **Giải pháp**: 
  1. Kiểm tra server đang chạy
  2. Kiểm tra kết nối mạng
  3. Refresh trang (F5)

### Lỗi: "Không có quyền truy cập"
- **Nguyên nhân**: Bạn không phải Admin
- **Giải pháp**: Đăng nhập bằng tài khoản Admin

### Lỗi: "Không thể xóa"
- **Nguyên nhân**: Loại đó đang được sử dụng
- **Giải pháp**: Xóa các bản ghi sử dụng loại này trước, rồi xóa loại

### Form không submit
- **Nguyên nhân**: Chưa điền các field bắt buộc
- **Giải pháp**: Kiểm tra tất cả field có * đều được điền

---

## 📱 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra Console (F12) để xem error messages
2. Kiểm tra Network tab để xem API calls
3. Kiểm tra quyền của tài khoản
4. Liên hệ Admin hệ thống

---

**Version**: 1.0  
**Cập nhật**: Hiện tại  
**Status**: ✅ Sẵn sàng sử dụng
