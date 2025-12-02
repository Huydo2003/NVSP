/* eslint-env node */
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const multer = require('multer');
const xlsx = require('xlsx');
require('dotenv').config();

const pool = require('./db');
const auth = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function md5(input) {
  return crypto.createHash('md5').update(String(input || '')).digest('hex');
}

function canonicalLoaiTk(value) {
  if (!value) return null;
  const v = String(value).toLowerCase();
  if (v.includes('admin')) return 'Admin';
  if (v.includes('giang') || v.includes('giảng')) return 'Giảng viên';
  if (v.includes('sinh') || v.includes('sinh viên')) return 'Sinh viên';
  // fallback: accept exact values
  if (v === 'giangvien') return 'Giảng viên';
  if (v === 'sinhvien') return 'Sinh viên';
  return null;
}

// Helper: check whether a given ma_ca_nhan is an active BCN (bcn_khoa.trang_thai = 1)
async function isUserBcn(ma_ca_nhan) {
  try {
    if (!ma_ca_nhan) return false;
    const [rows] = await pool.execute('SELECT ma_giang_vien, trang_thai FROM bcn_khoa WHERE ma_giang_vien = ? LIMIT 1', [ma_ca_nhan]);
    return (rows && rows.length > 0 && (rows[0].trang_thai === 1 || rows[0].trang_thai === true));
  } catch (err) {
    console.error('isUserBcn error', err);
    return false;
  }
}

// Helper: check whether a given ma_ca_nhan is an active ban_to_chuc (ban_to_chuc.trang_thai = 1)
async function isUserBtc(ma_ca_nhan) {
  try {
    if (!ma_ca_nhan) {
      console.log('isUserBtc: ma_ca_nhan is falsy');
      return false;
    }
    console.log('isUserBtc: querying ban_to_chuc for ma_giang_vien =', ma_ca_nhan);
    const [rows] = await pool.execute('SELECT ma_giang_vien, trang_thai FROM ban_to_chuc WHERE ma_giang_vien = ? LIMIT 1', [ma_ca_nhan]);
    console.log('isUserBtc: query returned', rows ? rows.length : 0, 'rows:', rows);
    if (!rows || rows.length === 0) {
      console.log('isUserBtc: no rows found, returning false');
      return false;
    }
    const trang_thai = rows[0].trang_thai;
    console.log('isUserBtc: trang_thai =', trang_thai, 'type:', typeof trang_thai);
    const result = (trang_thai === 1 || trang_thai === true);
    console.log('isUserBtc: final result =', result);
    return result;
  } catch (err) {
    console.error('isUserBtc error', err);
    return false;
  }
}

async function isUserCbl(ma_ca_nhan) {
  try {
    if (!ma_ca_nhan) return { isCbl: false };
    const [rows] = await pool.execute('SELECT ma_sinh_vien, bat_dau_nk, ket_thuc_nk, trang_thai FROM can_bo_lop WHERE ma_sinh_vien = ? LIMIT 1', [ma_ca_nhan]);
    if (!rows || rows.length === 0) return { isCbl: false };
    const r = rows[0];
    const active = (r.trang_thai === 1 || r.trang_thai === true);
    if (!active) return { isCbl: false };
    // get class of this cbl
    const [svRows] = await pool.execute('SELECT lop FROM sinh_vien WHERE ma_sinh_vien = ? LIMIT 1', [ma_ca_nhan]);
    const lop = (svRows && svRows[0]) ? svRows[0].lop : null;
    return { isCbl: true, lop };
  } catch (err) {
    console.error('isUserCbl error', err);
    return { isCbl: false };
  }
}

// Health
app.get('/api/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

// POST /api/login
// body: { ma_ca_nhan, mat_khau }
app.post('/api/login', async (req, res) => {
  try {
    const { ma_ca_nhan, mat_khau } = req.body || {};
    if (!ma_ca_nhan || !mat_khau) return res.status(400).json({ message: 'ma_ca_nhan và mat_khau là bắt buộc' });

    const [rows] = await pool.execute('SELECT id, ma_ca_nhan, ho_ten, mat_khau, loai_tk, email, created_at, updated_at FROM tai_khoan WHERE ma_ca_nhan = ? LIMIT 1', [ma_ca_nhan]);
    if (!rows || rows.length === 0) return res.status(401).json({ message: 'Tài khoản không tồn tại' });

    const user = rows[0];

    // mat_khau stored as MD5 in DB
    const hashedInput = md5(mat_khau);
    if (user.mat_khau !== hashedInput) return res.status(401).json({ message: 'Sai mật khẩu' });

    const payload = {
      id: user.id,
      ma_ca_nhan: user.ma_ca_nhan,
      role: user.loai_tk
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // require password change if not admin and never updated (created_at == updated_at)
    const mustChangePassword = (user.loai_tk !== 'Admin') && (String(user.created_at) === String(user.updated_at));

    res.json({ token, user: { id: user.id, ma_ca_nhan: user.ma_ca_nhan, ho_ten: user.ho_ten, role: user.loai_tk, email: user.email, mustChangePassword } });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/me
app.get('/api/me', auth, async (req, res) => {
  try {
    const uid = req.user && req.user.id;
    if (!uid) return res.status(401).json({ message: 'Invalid token payload' });

    const [rows] = await pool.execute('SELECT id, ma_ca_nhan, ho_ten, loai_tk, email, created_at, updated_at FROM tai_khoan WHERE id = ? LIMIT 1', [uid]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    const u = rows[0];
    const mustChangePassword = (u.loai_tk !== 'Admin') && (String(u.created_at) === String(u.updated_at));

    res.json({ id: u.id, ma_ca_nhan: u.ma_ca_nhan, ho_ten: u.ho_ten, role: u.loai_tk, email: u.email, created_at: u.created_at, updated_at: u.updated_at, mustChangePassword });
  } catch (err) {
    console.error('GET /api/me error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// NEW: Check whether current user is BCN (active)
app.get('/api/me/is_bcn', auth, async (req, res) => {
  try {
    const ma = req.user && req.user.ma_ca_nhan;
    const bcn = await isUserBcn(ma);
    res.json({ isBcn: !!bcn });
  } catch (err) {
    console.error('GET /api/me/is_bcn error', err);
    res.status(500).json({ isBcn: false });
  }
});

// NEW: Check whether current user is btc (active)
app.get('/api/me/is_btc', auth, async (req, res) => {
  try {
    console.log('\n=== /api/me/is_btc DEBUG START ===');
    console.log('req.user:', JSON.stringify(req.user));
    const ma = req.user && req.user.ma_ca_nhan;
    console.log('Extracted ma_ca_nhan:', ma);
    if (!ma) {
      console.log('ERROR: ma_ca_nhan is missing from token!');
      return res.json({ isBtc: false, debug: 'ma_ca_nhan missing from token' });
    }
    const btc = await isUserBtc(ma);
    console.log('isUserBtc returned:', btc);
    console.log('=== /api/me/is_btc DEBUG END ===\n');
    res.json({ isBtc: !!btc });
  } catch (err) {
    console.error('GET /api/me/is_btc error', err);
    res.status(500).json({ isBtc: false });
  }
});

app.get('/api/me/is_cbl', auth, async (req, res) => {
  try {
    const ma = req.user?.ma_ca_nhan;
    if (!ma) return res.json({ isCbl: false });
    const info = await isUserCbl(ma);
    return res.json({ isCbl: !!info.isCbl, lop: info.lop || null });
  } catch (err) {
    console.error('GET /api/me/is_cbl error', err);
    res.status(500).json({ isCbl: false });
  }
});

// --- User CRUD ---
// List users (admin)
app.get('/api/users', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const [rows] = await pool.execute('SELECT id, ma_ca_nhan, ho_ten, loai_tk, email, created_at, updated_at FROM tai_khoan ORDER BY id DESC');
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/users error', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Get by id
app.get('/api/users/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    // admin or self
    if ((req.user.role || '').toLowerCase() !== 'admin' && Number(req.user.id) !== Number(id)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const [rows] = await pool.execute('SELECT id, ma_ca_nhan, ho_ten, loai_tk, email, created_at, updated_at FROM tai_khoan WHERE id = ? LIMIT 1', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Người dùng không tồn tại' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/users/:id error', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Get by ma_ca_nhan
app.get('/api/users/ma/:ma', auth, async (req, res) => {
  try {
    const { ma } = req.params;
    // admin or self (self if ma matches)
    if ((req.user.role || '').toLowerCase() !== 'admin' && req.user.ma_ca_nhan !== ma) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const [rows] = await pool.execute('SELECT id, ma_ca_nhan, ho_ten, loai_tk, email, created_at, updated_at FROM tai_khoan WHERE ma_ca_nhan = ? LIMIT 1', [ma]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Người dùng không tồn tại' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/users/ma/:ma error', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// --- Su kien (Events) ---
// List events - any authenticated user can view
app.get('/api/su_kien', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id_sk, ten_sk, nam_hoc, ma_btc, trang_thai FROM su_kien ORDER BY nam_hoc DESC, ten_sk ASC');
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/su_kien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Get event details by id_sk - any authenticated user can view
app.get('/api/su_kien/:id_sk', auth, async (req, res) => {
  try {
    const { id_sk } = req.params;
    const [rows] = await pool.execute('SELECT id_sk, ten_sk, nam_hoc, ma_btc, trang_thai FROM su_kien WHERE id_sk = ? LIMIT 1', [id_sk]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Sự kiện không tồn tại' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/su_kien/:id_sk error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Create event - only Ban Tổ Chức (BTC) or admin
app.post('/api/su_kien', auth, async (req, res) => {
  try {
    const isBtc = await isUserBtc(req.user.ma_ca_nhan);
    if ((req.user.role || '').toLowerCase() !== 'admin' && !isBtc) {
      return res.status(403).json({ message: 'Chỉ Ban Tổ Chức (BTC) mới có thể tạo sự kiện' });
    }

    const { ten_sk, nam_hoc } = req.body || {};
    if (!ten_sk) return res.status(400).json({ message: 'Thiếu thông tin ten_sk' });
    if (!nam_hoc) return res.status(400).json({ message: 'Thiếu thông tin nam_hoc' });

    const year = Number(nam_hoc);
    const currentYear = new Date().getFullYear();
    if (Number.isNaN(year)) return res.status(400).json({ message: 'nam_hoc không hợp lệ' });
    if (year > currentYear) return res.status(400).json({ message: 'Năm tạo sự kiện không được trước năm hiện tại' });

    // Uniqueness: no duplicate event name in same year (case-insensitive)
    const [exist] = await pool.execute('SELECT id_sk FROM su_kien WHERE nam_hoc = ? AND LOWER(ten_sk) = LOWER(?) LIMIT 1', [year, ten_sk]);
    if (exist && exist.length > 0) {
      return res.status(400).json({ message: `Sự kiện '${ten_sk}' đã tồn tại trong năm học ${year}` });
    }

    // Insert event. trang_thai = true (open) by default
    await pool.execute('INSERT INTO su_kien (ten_sk, nam_hoc, ma_btc, trang_thai) VALUES (?, ?, ?, ?)', [ten_sk, year, req.user.ma_ca_nhan, 1]);
    res.status(201).json({ message: 'Đã tạo sự kiện' });
  } catch (err) {
    console.error('POST /api/su_kien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Update event (e.g., close/open registration) - only admin or the BTC who created it
app.put('/api/su_kien/:id_sk', auth, async (req, res) => {
  try {
    const { id_sk } = req.params;
    const { ten_sk, nam_hoc, trang_thai } = req.body || {};

    // Lấy thông tin sự kiện
    const [rows] = await pool.execute('SELECT id_sk, ma_btc FROM su_kien WHERE id_sk = ? LIMIT 1', [id_sk]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Sự kiện không tồn tại' });
    const event = rows[0];

    const isBtc = await isUserBtc(req.user.ma_ca_nhan);
    const isAdmin = (req.user.role || '').toLowerCase() === 'admin';
    if (!isAdmin && (!isBtc || event.ma_btc !== req.user.ma_ca_nhan)) {
      return res.status(403).json({ message: 'Chỉ BTC tạo sự kiện này hoặc Admin mới có thể sửa' });
    }

    // Update fields nếu có
    const updates = [];
    const params = [];

    if (ten_sk) {
      // Check duplicate tên cùng năm
      const [exist] = await pool.execute(
        'SELECT id_sk FROM su_kien WHERE nam_hoc = ? AND LOWER(ten_sk) = LOWER(?) AND id_sk <> ? LIMIT 1',
        [nam_hoc || event.nam_hoc, ten_sk, id_sk]
      );
      if (exist && exist.length > 0) {
        return res.status(400).json({ message: `Sự kiện '${ten_sk}' đã tồn tại trong năm học` });
      }
      updates.push('ten_sk = ?');
      params.push(ten_sk);
    }
    if (nam_hoc) {
      updates.push('nam_hoc = ?');
      params.push(nam_hoc);
    }
    if (typeof trang_thai !== 'undefined') {
      const tt = (trang_thai === true || trang_thai === 1 || String(trang_thai) === '1' || String(trang_thai).toLowerCase() === 'true') ? 1 : 0;
      updates.push('trang_thai = ?');
      params.push(tt);
    }

    if (updates.length === 0) return res.status(400).json({ message: 'Không có thông tin cập nhật' });

    params.push(id_sk);
    await pool.execute(`UPDATE su_kien SET ${updates.join(', ')} WHERE id_sk = ?`, params);
    res.json({ message: 'Đã cập nhật sự kiện' });
  } catch (err) {
    console.error('PUT /api/su_kien/:id_sk error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// 4. Delete event - only BTC (creator) or Admin
app.delete('/api/su_kien/:id_sk', auth, async (req, res) => {
  try {
    const { id_sk } = req.params;

    const [rows] = await pool.execute('SELECT id_sk, ma_btc FROM su_kien WHERE id_sk = ? LIMIT 1', [id_sk]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Sự kiện không tồn tại' });
    const event = rows[0];

    const isBtc = await isUserBtc(req.user.ma_ca_nhan);
    const isAdmin = (req.user.role || '').toLowerCase() === 'admin';
    if (!isAdmin && (!isBtc || event.ma_btc !== req.user.ma_ca_nhan)) {
      return res.status(403).json({ message: 'Chỉ BTC tạo sự kiện này hoặc Admin mới có thể xóa' });
    }

    await pool.execute('DELETE FROM su_kien WHERE id_sk = ?', [id_sk]);
    res.json({ message: 'Đã xóa sự kiện' });
  } catch (err) {
    console.error('DELETE /api/su_kien/:id_sk error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Create user (admin)
app.post('/api/users', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    let { ma_ca_nhan, ho_ten, mat_khau, loai_tk, email } = req.body || {};
    if (!ma_ca_nhan || !ho_ten || !loai_tk) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (ma_ca_nhan, ho_ten, loai_tk)' });

    const canonical = canonicalLoaiTk(loai_tk);
    if (!canonical) return res.status(400).json({ message: 'loai_tk không hợp lệ. Giá trị hợp lệ: Sinh viên, Giảng viên, Admin' });

    // uniqueness check
    const [exist] = await pool.execute('SELECT ma_ca_nhan, email FROM tai_khoan WHERE ma_ca_nhan = ? OR (email IS NOT NULL AND email = ?) LIMIT 1', [ma_ca_nhan, email || null]);

    if (exist && exist.length > 0) {
      const existingUser = exist[0];
      // Kiểm tra trùng ma_ca_nhan
      if (existingUser.ma_ca_nhan === ma_ca_nhan) {
        return res.status(400).json({ message: `Mã cá nhân (${ma_ca_nhan}) đã tồn tại` });
      }
      // Kiểm tra trùng email (nếu email được cung cấp)
      if (email && existingUser.email === email) {
        return res.status(400).json({ message: `Email (${email}) đã tồn tại` });
      }
      // Fallback cho trường hợp query phức tạp:
      return res.status(400).json({ message: 'ma_ca_nhan hoặc email đã tồn tại' });
    }

    // default password to ma_ca_nhan if not provided
    const finalPassword = (mat_khau && String(mat_khau).trim()) ? mat_khau : ma_ca_nhan;

    const hashed = md5(finalPassword);
    const [result] = await pool.execute('INSERT INTO tai_khoan (ma_ca_nhan, ho_ten, mat_khau, loai_tk, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [ma_ca_nhan, ho_ten, hashed, canonical, email || null]);

    const [rows] = await pool.execute('SELECT id, ma_ca_nhan, ho_ten, loai_tk, email, created_at, updated_at FROM tai_khoan WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/users error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Update user (admin or self)
app.put('/api/users/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    // allow admin or the user themself to update
    if ((req.user.role || '').toLowerCase() !== 'admin' && Number(req.user.id) !== Number(id)) return res.status(403).json({ message: 'Không có quyền truy cập' });

    let { ho_ten, email, loai_tk, mat_khau } = req.body || {};

    const [existing] = await pool.execute('SELECT id, mat_khau, loai_tk FROM tai_khoan WHERE id = ? LIMIT 1', [id]);
    if (!existing || existing.length === 0) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    const updates = [];
    const params = [];
    if (ho_ten !== undefined) { updates.push('ho_ten = ?'); params.push(ho_ten); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email || null); }
    if (mat_khau !== undefined) { updates.push('mat_khau = ?'); params.push(md5(mat_khau)); }
    if (loai_tk !== undefined) {
      if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền cập nhật loại tài khoản' });
      const canonical = canonicalLoaiTk(loai_tk);
      if (!canonical) return res.status(400).json({ message: 'loai_tk không hợp lệ. Giá trị hợp lệ: Sinh viên, Giảng viên, Admin' });
      updates.push('loai_tk = ?'); params.push(canonical);
    }

    if (updates.length === 0) return res.status(400).json({ message: 'Không có thông tin cần cập nhật' });

    params.push(id);
    await pool.execute(`UPDATE tai_khoan SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);

    const [rows] = await pool.execute('SELECT id, ma_ca_nhan, ho_ten, loai_tk, email, created_at, updated_at FROM tai_khoan WHERE id = ? LIMIT 1', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/users/:id error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Change password (self must provide currentPassword; admin can reset without currentPassword)
app.post('/api/users/:id/change-password', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword) return res.status(400).json({ message: 'newPassword là bắt buộc' });

    // only admin or owner
    if ((req.user.role || '').toLowerCase() !== 'admin' && Number(req.user.id) !== Number(id)) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const [existing] = await pool.execute('SELECT id, mat_khau FROM tai_khoan WHERE id = ? LIMIT 1', [id]);
    if (!existing || existing.length === 0) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    // if not admin, must verify currentPassword
    if ((req.user.role || '').toLowerCase() !== 'admin') {
      if (!currentPassword) return res.status(400).json({ message: 'currentPassword là bắt buộc' });
      if (existing[0].mat_khau !== md5(currentPassword)) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    await pool.execute('UPDATE tai_khoan SET mat_khau = ?, updated_at = NOW() WHERE id = ?', [md5(newPassword), id]);
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('POST /api/users/:id/change-password error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Delete user (admin)
app.delete('/api/users/:id', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });
    const { id } = req.params;
    if (Number(id) === Number(req.user.id)) return res.status(400).json({ message: 'Không thể xóa tài khoản đang đăng nhập' });

    // prevent deleting admin accounts
    const [check] = await pool.execute('SELECT loai_tk FROM tai_khoan WHERE id = ? LIMIT 1', [id]);
    if (!check || check.length === 0) return res.status(404).json({ message: 'Người dùng không tồn tại' });
    if (String(check[0].loai_tk).toLowerCase() === 'admin') return res.status(403).json({ message: 'Không thể xóa tài khoản Admin' });

    await pool.execute('DELETE FROM tai_khoan WHERE id = ?', [id]);
    res.json({ message: 'Đã xóa tài khoản' });
  } catch (err) {
    console.error('DELETE /api/users/:id error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Import users from Excel
app.post('/api/users/import', auth, upload.single('file'), async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    if (!req.file) return res.status(400).json({ message: 'Chưa chọn file' });

    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return res.status(400).json({ message: 'File Excel không có sheet nào' });

    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) return res.status(400).json({ message: 'File Excel không có dữ liệu' });

    // Validate and prepare rows
    const results = {
      success: [],
      errors: []
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Excel row number (header is row 1)

      try {
        // Extract and validate data
        const ma_ca_nhan = String(row.ma_ca_nhan || '').trim();
        const ho_ten = String(row.ho_ten || '').trim();
        const loai_tk_input = String(row.loai_tk || '').trim();
        const mat_khau_input = String(row.mat_khau || '').trim();
        const email = String(row.email || '').trim() || null;

        if (!ma_ca_nhan) throw new Error('Mã cá nhân không được để trống');
        if (!ho_ten) throw new Error('Họ tên không được để trống');
        if (!loai_tk_input) throw new Error('Loại tài khoản không được để trống');

        const loai_tk = canonicalLoaiTk(loai_tk_input);
        if (!loai_tk) throw new Error(`Loại tài khoản không hợp lệ: ${loai_tk_input}. Giá trị hợp lệ: Sinh viên, Giảng viên, Admin`);

        const mat_khau = mat_khau_input || ma_ca_nhan; // Default password to ma_ca_nhan if not provided

        // Check if user already exists
        const [exist] = await pool.execute(
          'SELECT id, ma_ca_nhan, email FROM tai_khoan WHERE ma_ca_nhan = ? OR (email IS NOT NULL AND email = ?) LIMIT 1',
          [ma_ca_nhan, email]
        );

        if (exist && exist.length > 0) {
          const existing = exist[0];
          if (existing.ma_ca_nhan === ma_ca_nhan) {
            throw new Error(`Mã cá nhân '${ma_ca_nhan}' đã tồn tại`);
          }
          if (existing.email === email) {
            throw new Error(`Email '${email}' đã tồn tại`);
          }
        }

        // Insert user
        await pool.execute(
          'INSERT INTO tai_khoan (ma_ca_nhan, ho_ten, mat_khau, loai_tk, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
          [ma_ca_nhan, ho_ten, md5(mat_khau), loai_tk, email]
        );

        // Create corresponding record in sinh_vien or giang_vien table
        if (loai_tk === 'Sinh viên') {
          const lop = String(row.lop || '').trim() || null;
          const nganh = String(row.nganh || '').trim() || null;
          const nien_khoa = String(row.nien_khoa || '').trim() || null;
          const khoa_sv = String(row.khoa || '').trim() || null;
          await pool.execute(
            'INSERT INTO sinh_vien (ma_sinh_vien, nien_khoa, lop, nganh, khoa) VALUES (?, ?, ?, ?, ?)',
            [ma_ca_nhan, nien_khoa, lop, nganh, khoa_sv]
          );
        } else if (loai_tk === 'Giảng viên') {
          const khoa = String(row.khoa || '').trim() || null;

          // Check if khoa already exists for another giang_vien
          if (khoa) {
            const [existingKhoa] = await pool.execute(
              'SELECT ma_giang_vien FROM giang_vien WHERE khoa = ? LIMIT 1',
              [khoa]
            );
            if (existingKhoa && existingKhoa.length > 0) {
              throw new Error(`Khoa '${khoa}' đã được gán cho giảng viên khác`);
            }
          }

          await pool.execute(
            'INSERT INTO giang_vien (ma_giang_vien, khoa) VALUES (?, ?)',
            [ma_ca_nhan, khoa]
          );
        }

        results.success.push({
          rowNum,
          ma_ca_nhan,
          ho_ten,
          loai_tk,
          message: 'Thêm thành công'
        });
      } catch (err) {
        results.errors.push({
          rowNum,
          message: err.message || 'Có lỗi xảy ra'
        });
      }
    }

    res.json(results);
  } catch (err) {
    console.error('POST /api/users/import error:', err);
    res.status(500).json({ message: 'Lỗi server khi xử lý import' });
  }
});

// BCN Khoa (bcn_khoa) management
app.get('/api/bcn_khoa', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });
    const [rows] = await pool.execute('SELECT ma_giang_vien, khoa, bat_dau_nk, ket_thuc_nk, trang_thai FROM bcn_khoa ORDER BY bat_dau_nk DESC');
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/bcn_khoa error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/bcn_khoa', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });
    const { ma_giang_vien, khoa, bat_dau_nk, ket_thuc_nk, trang_thai } = req.body || {};
    if (!ma_giang_vien || !khoa) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });

    // uniqueness check
    const [exist] = await pool.execute('SELECT ma_giang_vien, khoa FROM bcn_khoa WHERE ma_giang_vien = ? OR (khoa IS NOT NULL AND khoa = ?) LIMIT 1', [ma_giang_vien, khoa || null]);

    if (exist && exist.length > 0) {
      const existingBcn_Khoa = exist[0];
      // Kiểm tra trùng ma_giang_vien
      if (existingBcn_Khoa.ma_giang_vien === ma_giang_vien) {
        return res.status(400).json({ message: `Mã giảng viên (${ma_giang_vien}) đã tồn tại` });
      }
      // Kiểm tra trùng email (nếu email được cung cấp)
      if (khoa && existingBcn_Khoa.khoa === khoa) {
        return res.status(400).json({ message: `Khoa (${khoa}) đã tồn tại` });
      }
      // Fallback cho trường hợp query phức tạp:
      return res.status(400).json({ message: 'ma_giang_vien hoặc khoa đã tồn tại' });
    }

    await pool.execute('INSERT INTO bcn_khoa (ma_giang_vien, khoa, bat_dau_nk, ket_thuc_nk, trang_thai) VALUES (?, ?, ?, ?, ?)', [ma_giang_vien, khoa, bat_dau_nk || null, ket_thuc_nk || null, trang_thai ? 1 : 0]);
    res.status(201).json({ message: 'Đã thêm BCN Khoa' });
  } catch (err) {
    console.error('POST /api/bcn_khoa error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.put('/api/bcn_khoa/:ma_giang_vien', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });
    const { ma_giang_vien } = req.params;
    const { khoa, bat_dau_nk, ket_thuc_nk, trang_thai } = req.body || {};

    const updates = [];
    const params = [];
    if (khoa !== undefined) { updates.push('khoa = ?'); params.push(khoa); }
    if (bat_dau_nk !== undefined) { updates.push('bat_dau_nk = ?'); params.push(bat_dau_nk); }
    if (ket_thuc_nk !== undefined) { updates.push('ket_thuc_nk = ?'); params.push(ket_thuc_nk); }
    if (trang_thai !== undefined) { updates.push('trang_thai = ?'); params.push(trang_thai ? 1 : 0); }

    if (updates.length > 0) {
      params.push(ma_giang_vien);
      await pool.execute(`UPDATE bcn_khoa SET ${updates.join(', ')} WHERE ma_giang_vien = ?`, params);
    }

    res.json({ message: 'Đã cập nhật BCN Khoa' });
  } catch (err) {
    console.error('PUT /api/bcn_khoa/:ma_giang_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/api/bcn_khoa/:ma_giang_vien', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });
    const { ma_giang_vien } = req.params;
    await pool.execute('DELETE FROM bcn_khoa WHERE ma_giang_vien = ?', [ma_giang_vien]);
    res.json({ message: 'Đã xóa BCN Khoa' });
  } catch (err) {
    console.error('DELETE /api/bcn_khoa/:ma_giang_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Ban tổ chức (ban_to_chuc) - only BCN Khoa (active) can manage
app.get('/api/ban_to_chuc', auth, async (req, res) => {
  try {
    const ma = req.user && req.user.ma_ca_nhan;
    const bcn = await isUserBcn(ma);
    if (!bcn) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const [rows] = await pool.execute('SELECT ma_giang_vien, bat_dau_nk, ket_thuc_nk, trang_thai FROM ban_to_chuc ORDER BY bat_dau_nk DESC');
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/ban_to_chuc error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/ban_to_chuc', auth, async (req, res) => {
  try {
    const ma = req.user && req.user.ma_ca_nhan;
    const bcn = await isUserBcn(ma);
    if (!bcn) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_giang_vien, bat_dau_nk, ket_thuc_nk, trang_thai } = req.body || {};
    if (!ma_giang_vien) return res.status(400).json({ message: 'Thiếu thông tin ma_giang_vien' });

    await pool.execute('INSERT INTO ban_to_chuc (ma_giang_vien, bat_dau_nk, ket_thuc_nk, trang_thai) VALUES (?, ?, ?, ?)', [ma_giang_vien, bat_dau_nk || null, ket_thuc_nk || null, trang_thai ? 1 : 0]);
    res.status(201).json({ message: 'Đã thêm BTC' });
  } catch (err) {
    console.error('POST /api/ban_to_chuc error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.put('/api/ban_to_chuc/:ma_giang_vien', auth, async (req, res) => {
  try {
    const ma = req.user && req.user.ma_ca_nhan;
    const bcn = await isUserBcn(ma);
    if (!bcn) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_giang_vien } = req.params;
    const { bat_dau_nk, ket_thuc_nk, trang_thai } = req.body || {};

    const updates = [];
    const params = [];
    if (bat_dau_nk !== undefined) { updates.push('bat_dau_nk = ?'); params.push(bat_dau_nk); }
    if (ket_thuc_nk !== undefined) { updates.push('ket_thuc_nk = ?'); params.push(ket_thuc_nk); }
    if (trang_thai !== undefined) { updates.push('trang_thai = ?'); params.push(trang_thai ? 1 : 0); }

    if (updates.length > 0) {
      params.push(ma_giang_vien);
      await pool.execute(`UPDATE ban_to_chuc SET ${updates.join(', ')} WHERE ma_giang_vien = ?`, params);
    }

    res.json({ message: 'Đã cập nhật BTC' });
  } catch (err) {
    console.error('PUT /api/ban_to_chuc/:ma_giang_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/api/ban_to_chuc/:ma_giang_vien', auth, async (req, res) => {
  try {
    const ma = req.user && req.user.ma_ca_nhan;
    const bcn = await isUserBcn(ma);
    if (!bcn) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_giang_vien } = req.params;
    await pool.execute('DELETE FROM ban_to_chuc WHERE ma_giang_vien = ?', [ma_giang_vien]);
    res.json({ message: 'Đã xóa BTC' });
  } catch (err) {
    console.error('DELETE /api/ban_to_chuc/:ma_giang_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// BCN (bộ phận phụ trách khoa) management
app.get('/api/bcn', auth, async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    // admin sees all, giảng viên sees only their own BCN
    if (role === 'admin') {
      const [rows] = await pool.execute('SELECT ma_giang_vien, khoa, bat_dau_nk, ket_thuc_nk, trang_thai FROM bcn ORDER BY bat_dau_nk DESC');
      return res.json(rows || []);
    }

    // allow giảng viên to view their assigned BCN
    if (role.includes('giang') || role.includes('giảng')) {
      const ma = req.user.ma_ca_nhan;
      const [rows] = await pool.execute('SELECT ma_giang_vien, khoa, bat_dau_nk, ket_thuc_nk, trang_thai FROM bcn WHERE ma_giang_vien = ? ORDER BY bat_dau_nk DESC', [ma]);
      return res.json(rows || []);
    }

    return res.status(403).json({ message: 'Không có quyền truy cập' });
  } catch (err) {
    console.error('GET /api/bcn error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/bcn', auth, async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    const { ma_giang_vien, khoa, bat_dau_nk, ket_thuc_nk, trang_thai } = req.body || {};
    if (!ma_giang_vien) return res.status(400).json({ message: 'Thiếu thông tin ma_giang_vien' });

    // admin can create for anyone; giảng viên can only create for themselves
    if (role === 'admin' || role.includes('giang') || role.includes('giảng')) {
      if (role !== 'admin' && req.user.ma_ca_nhan !== ma_giang_vien) {
        return res.status(403).json({ message: 'Giảng viên chỉ có thể tạo BCN cho chính mình' });
      }

      await pool.execute('INSERT INTO bcn (ma_giang_vien, khoa, bat_dau_nk, ket_thuc_nk, trang_thai) VALUES (?, ?, ?, ?)', [ma_giang_vien, khoa, bat_dau_nk || null, ket_thuc_nk || null, trang_thai ? 1 : 0]);
      return res.status(201).json({ message: 'Đã thêm BCN' });
    }

    return res.status(403).json({ message: 'Không có quyền truy cập' });
  } catch (err) {
    console.error('POST /api/bcn error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.put('/api/bcn/:ma_giang_vien', auth, async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    const { ma_giang_vien } = req.params;
    const { khoa, bat_dau_nk, ket_thuc_nk, trang_thai } = req.body || {};

    // admin can update any; giảng viên can update only their own record
    if (role === 'admin' || role.includes('giang') || role.includes('giảng')) {
      if (role !== 'admin' && req.user.ma_ca_nhan !== ma_giang_vien) {
        return res.status(403).json({ message: 'Không có quyền cập nhật BCN này' });
      }

      const updates = [];
      const params = [];
      if (khoa !== undefined) { updates.push('khoa = ?'); params.push(khoa); }
      if (bat_dau_nk !== undefined) { updates.push('bat_dau_nk = ?'); params.push(bat_dau_nk); }
      if (ket_thuc_nk !== undefined) { updates.push('ket_thuc_nk = ?'); params.push(ket_thuc_nk); }
      if (trang_thai !== undefined) { updates.push('trang_thai = ?'); params.push(trang_thai ? 1 : 0); }

      if (updates.length > 0) {
        params.push(ma_giang_vien);
        await pool.execute(`UPDATE bcn SET ${updates.join(', ')} WHERE ma_giang_vien = ?`, params);
      }

      return res.json({ message: 'Đã cập nhật BCN' });
    }

    return res.status(403).json({ message: 'Không có quyền truy cập' });
  } catch (err) {
    console.error('PUT /api/bcn/:ma_giang_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/api/bcn/:ma_giang_vien', auth, async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    const { ma_giang_vien } = req.params;

    // admin can delete any; giảng viên can delete only their own record
    if (role === 'admin' || role.includes('giang') || role.includes('giảng')) {
      if (role !== 'admin' && req.user.ma_ca_nhan !== ma_giang_vien) {
        return res.status(403).json({ message: 'Không có quyền xóa BCN này' });
      }

      await pool.execute('DELETE FROM bcn WHERE ma_giang_vien = ?', [ma_giang_vien]);
      return res.json({ message: 'Đã xóa BCN' });
    }

    return res.status(403).json({ message: 'Không có quyền truy cập' });
  } catch (err) {
    console.error('DELETE /api/bcn/:ma_giang_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== BCN KHOA (Bộ phận phụ trách khoa) =====
// GET /api/bcn-khoa
app.get('/api/bcn-khoa', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT ma_giang_vien, khoa, bat_dau_nk, ket_thuc_nk, trang_thai FROM bcn_khoa ORDER BY khoa ASC'
    );
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/bcn-khoa error', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/giang-vien
app.get('/api/giang-vien', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT g.ma_giang_vien, g.khoa, t.email, t.ho_ten FROM giang_vien g JOIN tai_khoan t ON g.ma_giang_vien = t.ma_ca_nhan ORDER BY t.ho_ten ASC'
    );
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/giang-vien error', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/bcn-khoa
app.post('/api/bcn-khoa', auth, async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    if (role !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_giang_vien, khoa, bat_dau_nk, ket_thuc_nk, trang_thai } = req.body || {};
    if (!ma_giang_vien || !khoa || !bat_dau_nk) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    await pool.execute(
      'INSERT INTO bcn_khoa (ma_giang_vien, khoa, bat_dau_nk, ket_thuc_nk, trang_thai) VALUES (?, ?, ?, ?, ?)',
      [ma_giang_vien, khoa, bat_dau_nk, ket_thuc_nk || null, trang_thai ? 1 : 0]
    );
    res.status(201).json({ message: 'Đã thêm BCN Khoa' });
  } catch (err) {
    console.error('POST /api/bcn-khoa error', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/bcn-khoa/:ma_giang_vien
app.put('/api/bcn-khoa/:ma_giang_vien', auth, async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    if (role !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_giang_vien } = req.params;
    const { khoa, bat_dau_nk, ket_thuc_nk, trang_thai } = req.body || {};

    const updates = [];
    const params = [];
    if (khoa !== undefined) { updates.push('khoa = ?'); params.push(khoa); }
    if (bat_dau_nk !== undefined) { updates.push('bat_dau_nk = ?'); params.push(bat_dau_nk); }
    if (ket_thuc_nk !== undefined) { updates.push('ket_thuc_nk = ?'); params.push(ket_thuc_nk); }
    if (trang_thai !== undefined) { updates.push('trang_thai = ?'); params.push(trang_thai ? 1 : 0); }

    if (updates.length > 0) {
      params.push(ma_giang_vien);
      await pool.execute(`UPDATE bcn_khoa SET ${updates.join(', ')} WHERE ma_giang_vien = ?`, params);
    }

    res.json({ message: 'Đã cập nhật BCN Khoa' });
  } catch (err) {
    console.error('PUT /api/bcn-khoa/:ma_giang_vien error', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE /api/bcn-khoa/:ma_giang_vien
app.delete('/api/bcn-khoa/:ma_giang_vien', auth, async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    if (role !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_giang_vien } = req.params;
    await pool.execute('DELETE FROM bcn_khoa WHERE ma_giang_vien = ?', [ma_giang_vien]);
    res.json({ message: 'Đã xóa BCN Khoa' });
  } catch (err) {
    console.error('DELETE /api/bcn-khoa/:ma_giang_vien error', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== GIẢNG VIÊN (giang_vien) Management =====
// GET /api/giang_vien - List all teachers
app.get('/api/giang_vien', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const [rows] = await pool.execute(
      'SELECT gv.ma_giang_vien, gv.khoa, t.ho_ten, t.email FROM giang_vien gv JOIN tai_khoan t ON gv.ma_giang_vien = t.ma_ca_nhan ORDER BY t.ho_ten ASC'
    );
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/giang_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/giang_vien/:ma_giang_vien - Get by ID
app.get('/api/giang_vien/:ma_giang_vien', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_giang_vien } = req.params;
    const [rows] = await pool.execute(
      'SELECT gv.ma_giang_vien, gv.khoa, t.ho_ten, t.email FROM giang_vien gv JOIN tai_khoan t ON gv.ma_giang_vien = t.ma_ca_nhan WHERE gv.ma_giang_vien = ? LIMIT 1',
      [ma_giang_vien]
    );

    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Giảng viên không tồn tại' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/giang_vien/:ma_giang_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/giang_vien - Create new teacher
app.post('/api/giang_vien', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_giang_vien, khoa } = req.body || {};
    if (!ma_giang_vien) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: ma_giang_vien' });

    // Kiểm tra ma_giang_vien tồn tại trong tai_khoan
    const [userExists] = await pool.execute('SELECT id FROM tai_khoan WHERE ma_ca_nhan = ? LIMIT 1', [ma_giang_vien]);
    if (!userExists || userExists.length === 0) {
      return res.status(400).json({ message: `Mã giảng viên (${ma_giang_vien}) không tồn tại trong hệ thống` });
    }

    // Kiểm tra xem giảng viên đã tồn tại chưa
    const [exist] = await pool.execute('SELECT ma_giang_vien FROM giang_vien WHERE ma_giang_vien = ? LIMIT 1', [ma_giang_vien]);
    if (exist && exist.length > 0) {
      return res.status(400).json({ message: `Mã giảng viên (${ma_giang_vien}) đã tồn tại` });
    }

    // Insert mới
    await pool.execute('INSERT INTO giang_vien (ma_giang_vien, khoa) VALUES (?, ?)', [ma_giang_vien, khoa || null]);

    const [rows] = await pool.execute(
      'SELECT gv.ma_giang_vien, gv.khoa, t.ho_ten, t.email FROM giang_vien gv JOIN tai_khoan t ON gv.ma_giang_vien = t.ma_ca_nhan WHERE gv.ma_giang_vien = ? LIMIT 1',
      [ma_giang_vien]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/giang_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/giang_vien/:ma_giang_vien - Update teacher
app.put('/api/giang_vien/:ma_giang_vien', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_giang_vien } = req.params;
    const { khoa } = req.body || {};

    // Kiểm tra giảng viên tồn tại
    const [exist] = await pool.execute('SELECT ma_giang_vien FROM giang_vien WHERE ma_giang_vien = ? LIMIT 1', [ma_giang_vien]);
    if (!exist || exist.length === 0) {
      return res.status(404).json({ message: 'Giảng viên không tồn tại' });
    }

    const updates = [];
    const params = [];

    if (khoa !== undefined) {
      updates.push('khoa = ?');
      params.push(khoa || null);
    }

    if (updates.length === 0) return res.status(400).json({ message: 'Không có thông tin cần cập nhật' });

    params.push(ma_giang_vien);
    await pool.execute(`UPDATE giang_vien SET ${updates.join(', ')} WHERE ma_giang_vien = ?`, params);

    const [rows] = await pool.execute(
      'SELECT gv.ma_giang_vien, gv.khoa, t.ho_ten, t.email FROM giang_vien gv JOIN tai_khoan t ON gv.ma_giang_vien = t.ma_ca_nhan WHERE gv.ma_giang_vien = ? LIMIT 1',
      [ma_giang_vien]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/giang_vien/:ma_giang_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE /api/giang_vien/:ma_giang_vien - Delete teacher
app.delete('/api/giang_vien/:ma_giang_vien', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_giang_vien } = req.params;

    // Check if exists
    const [exist] = await pool.execute('SELECT ma_giang_vien FROM giang_vien WHERE ma_giang_vien = ? LIMIT 1', [ma_giang_vien]);
    if (!exist || exist.length === 0) {
      return res.status(404).json({ message: 'Giảng viên không tồn tại' });
    }

    await pool.execute('DELETE FROM giang_vien WHERE ma_giang_vien = ?', [ma_giang_vien]);
    res.json({ message: 'Đã xóa giảng viên' });
  } catch (err) {
    console.error('DELETE /api/giang_vien/:ma_giang_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== SINH VIÊN (sinh_vien) Management =====
// GET /api/sinh_vien - List all students (admin or BCN)
app.get('/api/sinh_vien', auth, async (req, res) => {
  try {
    const ma = req.user && req.user.ma_ca_nhan;
    const role = (req.user.role || '').toLowerCase();
    const bcn = await isUserBcn(ma);
    if (role !== 'admin' && !bcn) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const [rows] = await pool.execute(
      'SELECT sv.ma_sinh_vien, sv.nien_khoa, sv.lop, sv.nganh, sv.khoa, t.ho_ten, t.email FROM sinh_vien sv JOIN tai_khoan t ON sv.ma_sinh_vien = t.ma_ca_nhan ORDER BY t.ho_ten ASC'
    );
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/sinh_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/sinh_vien/:ma_sinh_vien - Get by ID (admin or BCN)
app.get('/api/sinh_vien/:ma_sinh_vien', auth, async (req, res) => {
  try {
    const ma = req.user && req.user.ma_ca_nhan;
    const role = (req.user.role || '').toLowerCase();
    const bcn = await isUserBcn(ma);
    if (role !== 'admin' && !bcn) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_sinh_vien } = req.params;
    const [rows] = await pool.execute(
      'SELECT sv.ma_sinh_vien, sv.nien_khoa, sv.lop, sv.nganh, sv.khoa, t.ho_ten, t.email FROM sinh_vien sv JOIN tai_khoan t ON sv.ma_sinh_vien = t.ma_ca_nhan WHERE sv.ma_sinh_vien = ? LIMIT 1',
      [ma_sinh_vien]
    );

    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Sinh viên không tồn tại' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/sinh_vien/:ma_sinh_vien error', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/sinh_vien - Create new student
app.post('/api/sinh_vien', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_sinh_vien, nien_khoa, lop, nganh, khoa } = req.body || {};
    if (!ma_sinh_vien) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: ma_sinh_vien' });

    // Kiểm tra ma_sinh_vien tồn tại trong tai_khoan
    const [userExists] = await pool.execute('SELECT id FROM tai_khoan WHERE ma_ca_nhan = ? LIMIT 1', [ma_sinh_vien]);
    if (!userExists || userExists.length === 0) {
      return res.status(400).json({ message: `Mã sinh viên (${ma_sinh_vien}) không tồn tại trong hệ thống` });
    }

    // Kiểm tra xem sinh viên đã tồn tại chưa
    const [exist] = await pool.execute('SELECT ma_sinh_vien FROM sinh_vien WHERE ma_sinh_vien = ? LIMIT 1', [ma_sinh_vien]);
    if (exist && exist.length > 0) {
      return res.status(400).json({ message: `Mã sinh viên (${ma_sinh_vien}) đã tồn tại` });
    }

    // Insert mới
    await pool.execute('INSERT INTO sinh_vien (ma_sinh_vien, nien_khoa, lop, nganh, khoa) VALUES (?, ?, ?, ?, ?)', [ma_sinh_vien, nien_khoa || null, lop || null, nganh || null, khoa || null]);

    const [rows] = await pool.execute(
      'SELECT sv.ma_sinh_vien, sv.nien_khoa, sv.lop, sv.nganh, sv.khoa, t.ho_ten, t.email FROM sinh_vien sv JOIN tai_khoan t ON sv.ma_sinh_vien = t.ma_ca_nhan WHERE sv.ma_sinh_vien = ? LIMIT 1',
      [ma_sinh_vien]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/sinh_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/sinh_vien/:ma_sinh_vien - Update student
app.put('/api/sinh_vien/:ma_sinh_vien', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_sinh_vien } = req.params;
    const { nien_khoa, lop, nganh, khoa } = req.body || {};

    // Kiểm tra sinh viên tồn tại
    const [exist] = await pool.execute('SELECT ma_sinh_vien FROM sinh_vien WHERE ma_sinh_vien = ? LIMIT 1', [ma_sinh_vien]);
    if (!exist || exist.length === 0) {
      return res.status(404).json({ message: 'Sinh viên không tồn tại' });
    }

    const updates = [];
    const params = [];
    if (nien_khoa !== undefined) { updates.push('nien_khoa = ?'); params.push(nien_khoa || null); }
    if (lop !== undefined) { updates.push('lop = ?'); params.push(lop || null); }
    if (nganh !== undefined) { updates.push('nganh = ?'); params.push(nganh || null); }
    if (khoa !== undefined) { updates.push('khoa = ?'); params.push(khoa || null); }

    if (updates.length === 0) return res.status(400).json({ message: 'Không có thông tin cần cập nhật' });

    params.push(ma_sinh_vien);
    await pool.execute(`UPDATE sinh_vien SET ${updates.join(', ')} WHERE ma_sinh_vien = ?`, params);

    const [rows] = await pool.execute(
      'SELECT sv.ma_sinh_vien, sv.nien_khoa, sv.lop, sv.nganh, sv.khoa, t.ho_ten, t.email FROM sinh_vien sv JOIN tai_khoan t ON sv.ma_sinh_vien = t.ma_ca_nhan WHERE sv.ma_sinh_vien = ? LIMIT 1',
      [ma_sinh_vien]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/sinh_vien/:ma_sinh_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE /api/sinh_vien/:ma_sinh_vien - Delete student
app.delete('/api/sinh_vien/:ma_sinh_vien', auth, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_sinh_vien } = req.params;

    // Check if exists
    const [exist] = await pool.execute('SELECT ma_sinh_vien FROM sinh_vien WHERE ma_sinh_vien = ? LIMIT 1', [ma_sinh_vien]);
    if (!exist || exist.length === 0) {
      return res.status(404).json({ message: 'Sinh viên không tồn tại' });
    }

    await pool.execute('DELETE FROM sinh_vien WHERE ma_sinh_vien = ?', [ma_sinh_vien]);
    res.json({ message: 'Đã xóa sinh viên' });
  } catch (err) {
    console.error('DELETE /api/sinh_vien/:ma_sinh_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Can bộ lớp (can_bo_lop) - only BCN Khoa (active) can manage
app.get('/api/can_bo_lop', auth, async (req, res) => {
  try {
    const ma = req.user && req.user.ma_ca_nhan;
    const bcn = await isUserBcn(ma);
    if (!bcn) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const [rows] = await pool.execute('SELECT ma_sinh_vien, bat_dau_nk, ket_thuc_nk, trang_thai FROM can_bo_lop ORDER BY bat_dau_nk DESC');
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/can_bo_lop error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/can_bo_lop', auth, async (req, res) => {
  try {
    const ma = req.user && req.user.ma_ca_nhan;
    const bcn = await isUserBcn(ma);
    if (!bcn) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_sinh_vien, bat_dau_nk, ket_thuc_nk, trang_thai } = req.body || {};
    if (!ma_sinh_vien) return res.status(400).json({ message: 'Thiếu thông tin ma_sinh_vien' });

    // uniqueness check
    const [exist] = await pool.execute('SELECT ma_sinh_vien FROM can_bo_lop WHERE ma_sinh_vien = ? LIMIT 1', [ma_sinh_vien]);

    if (exist && exist.length > 0) {
      const existing_CBL = exist[0];
      // Kiểm tra trùng ma_sinh_vien
      if (existing_CBL.ma_sinh_vien === ma_sinh_vien) {
        return res.status(400).json({ message: `Mã sinh viên (${ma_sinh_vien}) đã tồn tại` });
      }
    }

    await pool.execute('INSERT INTO can_bo_lop (ma_sinh_vien, bat_dau_nk, ket_thuc_nk, trang_thai) VALUES (?, ?, ?, ?)', [ma_sinh_vien, bat_dau_nk || null, ket_thuc_nk || null, trang_thai ? 1 : 0]);
    res.status(201).json({ message: 'Đã thêm CBL' });
  } catch (err) {
    console.error('POST /api/can_bo_lop error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.put('/api/can_bo_lop/:ma_sinh_vien', auth, async (req, res) => {
  try {
    const ma = req.user && req.user.ma_ca_nhan;
    const bcn = await isUserBcn(ma);
    if (!bcn) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_sinh_vien } = req.params;
    const { bat_dau_nk, ket_thuc_nk, trang_thai } = req.body || {};

    const updates = [];
    const params = [];
    if (bat_dau_nk !== undefined) { updates.push('bat_dau_nk = ?'); params.push(bat_dau_nk); }
    if (ket_thuc_nk !== undefined) { updates.push('ket_thuc_nk = ?'); params.push(ket_thuc_nk); }
    if (trang_thai !== undefined) { updates.push('trang_thai = ?'); params.push(trang_thai ? 1 : 0); }

    if (updates.length > 0) {
      params.push(ma_sinh_vien);
      await pool.execute(`UPDATE can_bo_lop SET ${updates.join(', ')} WHERE ma_sinh_vien = ?`, params);
    }

    res.json({ message: 'Đã cập nhật CBL' });
  } catch (err) {
    console.error('PUT /api/can_bo_lop/:ma_sinh_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/api/can_bo_lop/:ma_sinh_vien', auth, async (req, res) => {
  try {
    const ma = req.user && req.user.ma_ca_nhan;
    const bcn = await isUserBcn(ma);
    if (!bcn) return res.status(403).json({ message: 'Không có quyền truy cập' });

    const { ma_sinh_vien } = req.params;
    await pool.execute('DELETE FROM can_bo_lop WHERE ma_sinh_vien = ?', [ma_sinh_vien]);
    res.json({ message: 'Đã xóa CBL' });
  } catch (err) {
    console.error('DELETE /api/can_bo_lop/:ma_sinh_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== DS_RUBrIC =====
app.get('/api/ds_rubric', auth, async (req, res) => {
  try {
    // Check BTC (Ban Tổ Chức) only
    const isBtc = await isUserBtc(req.user.ma_ca_nhan);
    if ((req.user.role || '').toLowerCase() !== 'admin' && !isBtc) {
      return res.status(403).json({ message: 'Chỉ Ban Tổ Chức (BTC) mới có thể xem Rubric' });
    }

    const [rows] = await pool.execute('SELECT id_rubric, ten_rubric FROM ds_rubric ORDER BY ten_rubric ASC');
    res.json(rows || []);
  }
  catch (err) {
    console.error('GET /api/ds_rubric error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/ds_rubric', auth, async (req, res) => {
  try {
    // Check BTC (Ban Tổ Chức) only
    const isBtc = await isUserBtc(req.user.ma_ca_nhan);
    if ((req.user.role || '').toLowerCase() !== 'admin' && !isBtc) {
      return res.status(403).json({ message: 'Chỉ Ban Tổ Chức (BTC) mới có thể tạo Rubric' });
    }

    const { ten_rubric } = req.body || {};

    // uniqueness check
    const [exist] = await pool.execute('SELECT ten_rubric FROM ds_rubric WHERE ten_rubric = ? LIMIT 1', [ten_rubric]);

    if (exist && exist.length > 0) {
      const existing = exist[0];
      // Kiểm tra trùng ten_rubric
      if (existing.ten_rubric === ten_rubric) {
        return res.status(400).json({ message: `Tên Rubric (${ten_rubric}) đã tồn tại` });
      }
    }

    if (!ten_rubric) return res.status(400).json({ message: 'Thiếu thông tin ten_rubric' });
    await pool.execute('INSERT INTO ds_rubric (ten_rubric) VALUES (?)', [ten_rubric]);
    res.status(201).json({ message: 'Đã thêm rubric' });
  }
  catch (err) {
    console.error('POST /api/ds_rubric error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.put('/api/ds_rubric/:id_rubric', auth, async (req, res) => {
  try {
    // Check BTC (Ban Tổ Chức) only
    const isBtc = await isUserBtc(req.user.ma_ca_nhan);
    if ((req.user.role || '').toLowerCase() !== 'admin' && !isBtc) {
      return res.status(403).json({ message: 'Chỉ Ban Tổ Chức (BTC) mới có thể sửa Rubric' });
    }

    const { id_rubric } = req.params;
    const { ten_rubric } = req.body || {};

    // uniqueness check
    const [exist] = await pool.execute('SELECT ten_rubric FROM ds_rubric WHERE ten_rubric = ? LIMIT 1', [ten_rubric]);

    if (exist && exist.length > 0) {
      const existing = exist[0];
      // Kiểm tra trùng ten_rubric
      if (existing.ten_rubric === ten_rubric) {
        return res.status(400).json({ message: `Tên Rubric (${ten_rubric}) đã tồn tại` });
      }
    }

    if (!ten_rubric) return res.status(400).json({ message: 'Thiếu thông tin ten_rubric' });
    await pool.execute('UPDATE ds_rubric SET ten_rubric = ? WHERE id_rubric = ?', [ten_rubric, id_rubric]);
    res.json({ message: 'Đã cập nhật rubric' });
  }
  catch (err) {
    console.error('PUT /api/ds_rubric/:id_rubric error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/api/ds_rubric/:id_rubric', auth, async (req, res) => {
  try {
    // Check BTC (Ban Tổ Chức) only
    const isBtc = await isUserBtc(req.user.ma_ca_nhan);
    if ((req.user.role || '').toLowerCase() !== 'admin' && !isBtc) {
      return res.status(403).json({ message: 'Chỉ Ban Tổ Chức (BTC) mới có thể xóa Rubric' });
    }

    const { id_rubric } = req.params;
    await pool.execute('DELETE FROM ds_rubric WHERE id_rubric = ?', [id_rubric]);
    res.json({ message: 'Đã xóa rubric' });
  }
  catch (err) {
    console.error('DELETE /api/ds_rubric/:id_rubric error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== CHI_TIET_RUBRIC CRUD =====
app.get('/api/chi_tiet_rubric/:id_rubric', auth, async (req, res) => {
  try {
    const { id_rubric } = req.params;
    const [rows] = await pool.execute('SELECT id_rubric, tieu_chi, diem_toi_da FROM chi_tiet_rubric WHERE id_rubric = ? ORDER BY tieu_chi ASC', [id_rubric]);
    res.json(rows || []);
  } catch (err) {
    console.error('GET chi_tiet_rubric error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/chi_tiet_rubric', auth, async (req, res) => {
  try {
    // Check BTC (Ban Tổ Chức) only
    const isBtc = await isUserBtc(req.user.ma_ca_nhan);
    if ((req.user.role || '').toLowerCase() !== 'admin' && !isBtc) {
      return res.status(403).json({ message: 'Chỉ Ban Tổ Chức (BTC) mới có thể tạo chi tiết Rubric' });
    }

    const { id_rubric, tieu_chi, diem_toi_da } = req.body || {};

    if (!tieu_chi) return res.status(400).json({ message: 'Tiêu chí không được để trống' });

    const diem = Number(diem_toi_da);
    if (isNaN(diem)) {
      return res.status(400).json({ message: 'Điểm tối đa phải là số' });
    }

    // Check duplicate tieu_chi
    const [exist] = await pool.execute('SELECT tieu_chi FROM chi_tiet_rubric WHERE id_rubric = ? AND tieu_chi = ? LIMIT 1', [id_rubric, tieu_chi]);
    if (exist && exist.length > 0) {
      return res.status(400).json({ message: `Tiêu chí '${tieu_chi}' đã tồn tại trong Rubric này` });
    }

    await pool.execute('INSERT INTO chi_tiet_rubric (id_rubric, tieu_chi, diem_toi_da) VALUES (?, ?, ?)', [id_rubric, tieu_chi, diem || 0]);
    res.status(201).json({ message: 'Đã thêm chi tiết Rubric' });
  } catch (err) {
    console.error('POST chi_tiet_rubric error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.put('/api/chi_tiet_rubric/:id_rubric/:tieu_chi', auth, async (req, res) => {
  try {
    // Check BTC (Ban Tổ Chức) only
    const isBtc = await isUserBtc(req.user.ma_ca_nhan);
    if ((req.user.role || '').toLowerCase() !== 'admin' && !isBtc) {
      return res.status(403).json({ message: 'Chỉ Ban Tổ Chức (BTC) mới có thể sửa chi tiết Rubric' });
    }

    const { id_rubric, tieu_chi } = req.params;
    const { tieu_chi: new_tieu_chi, diem_toi_da } = req.body || {};

    if (!new_tieu_chi) return res.status(400).json({ message: 'Tiêu chí không được để trống' });

    const diem = Number(diem_toi_da);
    if (isNaN(diem)) {
      return res.status(400).json({ message: 'Điểm tối đa phải là số' });
    }

    // If tieu_chi changed, check duplicate
    if (new_tieu_chi !== tieu_chi) {
      const [exist] = await pool.execute('SELECT tieu_chi FROM chi_tiet_rubric WHERE id_rubric = ? AND tieu_chi = ? LIMIT 1', [id_rubric, new_tieu_chi]);
      if (exist && exist.length > 0) {
        return res.status(400).json({ message: `Tiêu chí '${new_tieu_chi}' đã tồn tại` });
      }
    }

    await pool.execute('UPDATE chi_tiet_rubric SET tieu_chi = ?, diem_toi_da = ? WHERE id_rubric = ? AND tieu_chi = ?', [new_tieu_chi, diem || 0, id_rubric, tieu_chi]);
    res.json({ message: 'Đã cập nhật chi tiết Rubric' });
  } catch (err) {
    console.error('PUT chi_tiet_rubric error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/api/chi_tiet_rubric/:id_rubric/:tieu_chi', auth, async (req, res) => {
  try {
    // Check BTC (Ban Tổ Chức) only
    const isBtc = await isUserBtc(req.user.ma_ca_nhan);
    if ((req.user.role || '').toLowerCase() !== 'admin' && !isBtc) {
      return res.status(403).json({ message: 'Chỉ Ban Tổ Chức (BTC) mới có thể xóa chi tiết Rubric' });
    }

    const { id_rubric, tieu_chi } = req.params;
    await pool.execute('DELETE FROM chi_tiet_rubric WHERE id_rubric = ? AND tieu_chi = ?', [id_rubric, tieu_chi]);
    res.json({ message: 'Đã xóa chi tiết Rubric' });
  } catch (err) {
    console.error('DELETE chi_tiet_rubric error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


// ===== HOAT_DONG CRUD =====
app.get('/api/hoat_dong', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT hd.id_hd, hd.ten_hd, hd.loai_hd, hd.tg_bat_dau, hd.tg_ket_thuc, hd.dia_diem, hd.id_sk
      FROM hoat_dong hd
      ORDER BY hd.tg_bat_dau DESC`
    );
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/hoat_dong error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Post new hoat_dong
app.post('/api/hoat_dong', auth, async (req, res) => {
  try {
    const { ten_hd, loai_hd, tg_bat_dau, tg_ket_thuc, dia_diem, id_sk } = req.body || {};

    if (!ten_hd || !loai_hd || !tg_bat_dau || !tg_ket_thuc || !dia_diem || !id_sk) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    // Check duplicate ten_hd within the same event (id_sk)
    const [exist] = await pool.execute('SELECT ten_hd FROM hoat_dong WHERE id_sk = ? AND ten_hd = ? LIMIT 1', [id_sk, ten_hd]);
    if (exist && exist.length > 0) {
      return res.status(400).json({ message: `Tên hoạt động (${ten_hd}) đã tồn tại trong sự kiện này` });
    }
    await pool.execute(
      'INSERT INTO hoat_dong (ten_hd, loai_hd, tg_bat_dau, tg_ket_thuc, dia_diem, id_sk) VALUES (?, ?, ?, ?, ?, ?)',
      [ten_hd, loai_hd, tg_bat_dau, tg_ket_thuc, dia_diem, id_sk]
    );
    res.status(201).json({ message: 'Đã tạo hoạt động' });
  } catch (err) {
    console.error('POST /api/hoat_dong error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Put update hoat_dong
app.put('/api/hoat_dong/:id_hd', auth, async (req, res) => {
  try {
    const { id_hd } = req.params;
    const { ten_hd, loai_hd, tg_bat_dau, tg_ket_thuc, dia_diem, id_sk } = req.body || {};
    if (!ten_hd || !loai_hd || !tg_bat_dau || !tg_ket_thuc || !dia_diem || !id_sk) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    // Check duplicate ten_hd within the same event (id_sk)
    const [exist] = await pool.execute('SELECT ten_hd FROM hoat_dong WHERE id_sk = ? AND ten_hd = ? AND id_hd != ? LIMIT 1', [id_sk, ten_hd, id_hd]);
    if (exist && exist.length > 0) {
      return res.status(400).json({ message: `Tên hoạt động (${ten_hd}) đã tồn tại trong sự kiện này` });
    }
    await pool.execute(
      'UPDATE hoat_dong SET ten_hd = ?, loai_hd = ?, tg_bat_dau = ?, tg_ket_thuc = ?, dia_diem = ?, id_sk = ? WHERE id_hd = ?',
      [ten_hd, loai_hd, tg_bat_dau, tg_ket_thuc, dia_diem, id_sk, id_hd]
    );
    res.json({ message: 'Đã cập nhật hoạt động' });
  } catch (err) {
    console.error('PUT /api/hoat_dong/:id_hd error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Delete hoat_dong
app.delete('/api/hoat_dong/:id_hd', auth, async (req, res) => {
  try {
    const { id_hd } = req.params;
    await pool.execute('DELETE FROM hoat_dong WHERE id_hd = ?', [id_hd]);
    res.json({ message: 'Đã xóa hoạt động' });
  } catch (err) {
    console.error('DELETE /api/hoat_dong_thi/:id_hd error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


// ===== HOAT_DONG_THI CRUD =====
app.get('/api/hoat_dong_thi', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT hdt.id_hd, hd.ten_hd, hdt.id_rubric, dr.ten_rubric, hdt.hinh_thuc, hdt.so_luong_tv
       FROM hoat_dong_thi hdt
       JOIN ds_rubric dr ON hdt.id_rubric = dr.id_rubric
       JOIN hoat_dong hd ON hdt.id_hd = hd.id_hd`
    );
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/hoat_dong_thi error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Post new hoat_dong_thi
app.post('/api/hoat_dong_thi', auth, async (req, res) => {
  try {
    const { id_hd, id_rubric, hinh_thuc, so_luong_tv } = req.body || {};

    if (!id_hd || !id_rubric || !hinh_thuc || !so_luong_tv) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Check duplicate id_hd
    const [exist] = await pool.execute('SELECT id_hd FROM hoat_dong_thi WHERE id_hd = ? LIMIT 1', [id_hd]);
    if (exist && exist.length > 0) {
      return res.status(400).json({ message: `Hoạt động này đã tồn tại.` });
    }

    await pool.execute(
      'INSERT INTO hoat_dong_thi (id_hd, id_rubric, hinh_thuc, so_luong_tv) VALUES (?, ?, ?, ?)',
      [id_hd, id_rubric, hinh_thuc, so_luong_tv]
    );
    res.status(201).json({ message: 'Đã tạo hoạt động thi' });
  } catch (err) {
    console.error('POST /api/hoat_dong_thi error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Put update hoat_dong_thi
app.put('/api/hoat_dong_thi/:id_hd', auth, async (req, res) => {
  try {
    const { id_hd } = req.params;
    const { id_rubric, hinh_thuc, so_luong_tv } = req.body || {};

    if (!id_hd || !id_rubric || !hinh_thuc || !so_luong_tv) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    await pool.execute(
      'UPDATE hoat_dong_thi SET id_rubric = ?, hinh_thuc = ?, so_luong_tv = ? WHERE id_hd = ?',
      [id_rubric, hinh_thuc, so_luong_tv, id_hd]
    );
    res.json({ message: 'Đã cập nhật hoạt động thi' });
  } catch (err) {
    console.error('PUT /api/hoat_dong_thi/:id_hd error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Delete hoat_dong_thi
app.delete('/api/hoat_dong_thi/:id_hd', auth, async (req, res) => {
  try {
    const { id_hd } = req.params;
    await pool.execute('DELETE FROM hoat_dong_thi WHERE id_hd = ?', [id_hd]);
    res.json({ message: 'Đã xóa hoạt động thi' });
  } catch (err) {
    console.error('DELETE /api/hoat_dong_thi/:id_hd error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// === ban_giam_khao CRUD ===
app.get('/api/ban_giam_khao', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT bgk.id_hd, hd.ten_hd, bgk.ma_giang_vien, tk.ho_ten
     FROM ban_giam_khao bgk
     LEFT JOIN hoat_dong_thi hdt ON bgk.id_hd = hdt.id_hd
     LEFT JOIN hoat_dong hd ON hdt.id_hd = hd.id_hd
     LEFT JOIN giang_vien gv ON bgk.ma_giang_vien = gv.ma_giang_vien
     LEFT JOIN tai_khoan tk ON gv.ma_giang_vien = tk.ma_ca_nhan`
    );
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/ban_giam_khao error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Post new ban_giam_khao
app.post('/api/ban_giam_khao', auth, async (req, res) => {
  try {
    const { id_hd, ma_giang_vien } = req.body || {};
    if (!id_hd || !ma_giang_vien) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Check duplicate id_hd and ma_giang_vien
    const [exist] = await pool.execute('SELECT id_hd, ma_giang_vien FROM ban_giam_khao WHERE id_hd = ? AND ma_giang_vien = ? LIMIT 1', [id_hd, ma_giang_vien]);
    if (exist && exist.length > 0) {
      return res.status(400).json({ message: `Giảng viên này đã là thành viên ban giám khảo của hoạt động.` });
    }

    await pool.execute(
      'INSERT INTO ban_giam_khao (id_hd, ma_giang_vien) VALUES (?, ?)',
      [id_hd, ma_giang_vien]
    );
    res.status(201).json({ message: 'Đã thêm ban giám khảo' });
  } catch (err) {
    console.error('POST /api/ban_giam_khao error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Delete ban_giam_khao
app.delete('/api/ban_giam_khao/:id_hd/:ma_giang_vien', auth, async (req, res) => {
  try {
    const { id_hd, ma_giang_vien } = req.params;
    await pool.execute('DELETE FROM ban_giam_khao WHERE id_hd = ? AND ma_giang_vien = ?', [id_hd, ma_giang_vien]);
    res.json({ message: 'Đã xóa ban giám khảo' });
  }
  catch (err) {
    console.error('DELETE /api/ban_giam_khao/:id_hd/:ma_giang_vien error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
})

// === hoat-dong-tham-du CRUD ===
app.get('/api/hoat-dong-tham-du', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT hdt.id_hd_tham_du, hdt.ten_hd, hdt.id_hd, hd.tg_bat_dau, hd.tg_ket_thuc, hd.dia_diem
      FROM hoat_dong_tham_du hdt
      LEFT JOIN hoat_dong hd ON hdt.id_hd = hd.id_hd
      ORDER BY hd.tg_bat_dau DESC`
    );
    res.json(rows || []);
  }
  catch (err) {
    console.error('GET /api/hoat-dong-tham-du error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/hoat-dong-tham-du', auth, async (req, res) => {
  try {
    const { ten_hd, id_hd } = req.body || {};
    if (!ten_hd || !id_hd) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    await pool.execute(
      'INSERT INTO hoat_dong_tham_du (ten_hd, id_hd) VALUES (?, ?)',
      [ten_hd, id_hd]
    );
    res.status(201).json({ message: 'Đã tạo hoạt động tham dự' });
  }
  catch (err) {
    console.error('POST /api/hoat-dong-tham-du error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.put('/api/hoat-dong-tham-du/:id_hd_tham_du', auth, async (req, res) => {
  try {
    const { id_hd_tham_du } = req.params;
    const { ten_hd, id_hd } = req.body || {};
    if (!ten_hd || !id_hd) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    await pool.execute(
      'UPDATE hoat_dong_tham_du SET ten_hd = ?, id_hd = ? WHERE id_hd_tham_du = ?',
      [ten_hd, id_hd, id_hd_tham_du]
    );
    res.json({ message: 'Đã cập nhật hoạt động tham dự' });
  }
  catch (err) {
    console.error('PUT /api/hoat-dong-tham-du/:id_hd_tham_du error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/api/hoat-dong-tham-du/:id_hd_tham_du', auth, async (req, res) => {
  try {
    const { id_hd_tham_du } = req.params;
    await pool.execute('DELETE FROM hoat_dong_tham_du WHERE id_hd_tham_du = ?', [id_hd_tham_du]);
    res.json({ message: 'Đã xóa hoạt động tham dự' });
  }
  catch (err) {
    console.error('DELETE /api/hoat-dong-tham-du/:id_hd_tham_du error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// === hoat_dong_ho_tro CRUD ===
app.get('/api/hoat-dong-ho-tro', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT hht.id_hd_ho_tro, hht.ten_hd, hht.loai_ho_tro, hht.id_hd, hd.tg_bat_dau, hd.tg_ket_thuc, hd.dia_diem, hht.ma_gv, tk.ho_ten
      FROM hoat_dong_ho_tro hht
      LEFT JOIN hoat_dong hd ON hht.id_hd = hd.id_hd
      LEFT JOIN giang_vien gv ON hht.ma_gv = gv.ma_giang_vien
      LEFT JOIN tai_khoan tk ON gv.ma_giang_vien = tk.ma_ca_nhan
      ORDER BY hd.tg_bat_dau DESC`
    );
    res.json(rows || []);
  }
  catch (err) {
    console.error('GET /api/hoat-dong-ho-tro error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/hoat-dong-ho-tro', auth, async (req, res) => {
  try {
    const { ten_hd, loai_ho_tro, id_hd, ma_gv } = req.body || {};
    if (!ten_hd || !loai_ho_tro || !id_hd || !ma_gv) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    await pool.execute(
      'INSERT INTO hoat_dong_ho_tro (ten_hd, loai_ho_tro, id_hd, ma_gv) VALUES (?, ?, ?, ?)',
      [ten_hd, loai_ho_tro, id_hd, ma_gv]
    );
    res.status(201).json({ message: 'Đã tạo hoạt động hỗ trợ' });
  }
  catch (err) {
    console.error('POST /api/hoat-dong-ho-tro error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.put('/api/hoat-dong-ho-tro/:id_hd_ho_tro', auth, async (req, res) => {
  try {
    const { id_hd_ho_tro } = req.params;
    const { ten_hd, loai_ho_tro, id_hd, ma_gv } = req.body || {};
    if (!ten_hd || !loai_ho_tro || !id_hd || !ma_gv) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    await pool.execute(
      'UPDATE hoat_dong_ho_tro SET ten_hd = ?, loai_ho_tro = ?, id_hd = ?, ma_gv = ? WHERE id_hd_ho_tro = ?',
      [ten_hd, loai_ho_tro, id_hd, ma_gv, id_hd_ho_tro]
    );
    res.json({ message: 'Đã cập nhật hoạt động hỗ trợ' });
  }
  catch (err) {
    console.error('PUT /api/hoat-dong-ho-tro/:id_hd_ho_tro error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/api/hoat-dong-ho-tro/:id_hd_ho_tro', auth, async (req, res) => {
  try {
    const { id_hd_ho_tro } = req.params;
    await pool.execute('DELETE FROM hoat_dong_ho_tro WHERE id_hd_ho_tro = ?', [id_hd_ho_tro]);
    res.json({ message: 'Đã xóa hoạt động hỗ trợ' });
  }
  catch (err) {
    console.error('DELETE /api/hoat-dong-ho-tro/:id_hd_ho_tro error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// === dki_tham_du (Đăng ký tham dự) ===
// GET /api/dki-tham-du - Get registrations for current student
app.get('/api/dki-tham-du', auth, async (req, res) => {
  try {
    const ma_sv = req.user.ma_ca_nhan;
    const [rows] = await pool.execute(
      `SELECT dt.ma_sv, dt.id_hd, dt.trang_thai, 
              tk.ho_ten, sv.lop,
              hd.ten_hd
       FROM dki_tham_du dt
       LEFT JOIN tai_khoan tk ON dt.ma_sv = tk.ma_ca_nhan
       LEFT JOIN sinh_vien sv ON dt.ma_sv = sv.ma_sinh_vien
       LEFT JOIN hoat_dong_tham_du hdt ON dt.id_hd = hdt.id_hd_tham_du
       LEFT JOIN hoat_dong hd ON hdt.id_hd = hd.id_hd
       WHERE dt.ma_sv = ?
       ORDER BY hd.tg_bat_dau DESC`,
      [ma_sv]
    );
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/dki-tham-du error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/dki-tham-du - student registers for a participation activity (personal only)
app.post('/api/dki-tham-du', auth, async (req, res) => {
  try {
    const ma_sv = req.user.ma_ca_nhan;
    const { id_hd } = req.body || {};
    if (!id_hd) return res.status(400).json({ message: 'Thiếu id_hd' });

    // check activity exists
    const [hdtRows] = await pool.execute('SELECT id_hd_tham_du, id_hd FROM hoat_dong_tham_du WHERE id_hd_tham_du = ? LIMIT 1', [id_hd]);
    if (!hdtRows || hdtRows.length === 0) return res.status(404).json({ message: 'Hoạt động tham dự không tồn tại' });

    // check duplicate
    const [exist] = await pool.execute('SELECT ma_sv FROM dki_tham_du WHERE id_hd = ? AND ma_sv = ? LIMIT 1', [id_hd, ma_sv]);
    if (exist && exist.length > 0) return res.status(400).json({ message: 'Bạn đã đăng ký tham dự hoạt động này' });

    // Cross-check: if student already registered for exam (dang_ky_thi) for same id_hd, block
    const [conflict] = await pool.execute('SELECT ma_sv FROM dang_ky_thi WHERE id_hd = ? AND ma_sv = ? LIMIT 1', [id_hd, ma_sv]);
    if (conflict && conflict.length > 0) return res.status(400).json({ message: 'Bạn đã đăng ký thi cho hoạt động này, không thể đăng ký tham dự' });

    await pool.execute('INSERT INTO dki_tham_du (ma_sv, id_hd, trang_thai) VALUES (?, ?, ?)', [ma_sv, id_hd, 0]);
    res.status(201).json({ message: 'Đã đăng ký tham dự. Chờ duyệt từ CBL.' });
  } catch (err) {
    console.error('POST /api/dki-tham-du error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/dki-tham-du/class - CBL gets registrations for their class
app.get('/api/dki-tham-du/class', auth, async (req, res) => {
  try {
    const ma = req.user.ma_ca_nhan;
    const info = await isUserCbl(ma);
    if (!info.isCbl) return res.status(403).json({ message: 'Không có quyền truy cập' });
    const lop = info.lop;
    const [rows] = await pool.execute(
      `SELECT d.ma_sv, d.id_hd, d.trang_thai, sv.lop, tk.ho_ten, tk.email
       FROM dki_tham_du d
       JOIN sinh_vien sv ON d.ma_sv = sv.ma_sinh_vien
       LEFT JOIN tai_khoan tk ON sv.ma_sinh_vien = tk.ma_ca_nhan
       WHERE sv.lop = ?
       ORDER BY d.id_hd DESC`,
      [lop]
    );
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/dki-tham-du/class error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.get('/api/diem-danh/stats', auth, async (req, res) => {
  try {
    // Aggregate counts per activity id (id_hd)
    const [rows] = await pool.execute(
      `SELECT 
          dd.id_hd AS id_hd_tham_du,
          SUM(CASE WHEN dd.trang_thai = 0 THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN dd.trang_thai = 1 THEN 1 ELSE 0 END) AS approved,
          SUM(CASE WHEN dd.trang_thai = -1 THEN 1 ELSE 0 END) AS rejected,
          COUNT(*) AS total
        FROM diem_danh dd
        GROUP BY dd.id_hd`
    );

    // Cast numbers and ensure id is string to be consistent with frontend
    const data = (rows || []).map(r => ({
      id_hd_tham_du: r.id_hd_tham_du != null ? String(r.id_hd_tham_du) : null,
      pending: Number(r.pending || 0),
      approved: Number(r.approved || 0),
      rejected: Number(r.rejected || 0),
      total: Number(r.total || 0)
    }));

    res.json(data);
  } catch (err) {
    console.error('GET /api/diem-danh/stats error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/dki-tham-du/:ma_sv/:id_hd - CBL approves/rejects a registration
app.put('/api/dki-tham-du/:ma_sv/:id_hd', auth, async (req, res) => {
  try {
    const ma = req.user.ma_ca_nhan;
    const { ma_sv, id_hd } = req.params;
    const { trang_thai } = req.body || {};
    const info = await isUserCbl(ma);
    if (!info.isCbl) return res.status(403).json({ message: 'Không có quyền truy cập' });

    // Verify target student belongs to same class
    const [svRows] = await pool.execute('SELECT lop FROM sinh_vien WHERE ma_sinh_vien = ? LIMIT 1', [ma_sv]);
    if (!svRows || svRows.length === 0) return res.status(404).json({ message: 'Sinh viên không tồn tại' });
    if (svRows[0].lop !== info.lop) return res.status(403).json({ message: 'Không thể duyệt đăng ký ngoài lớp của bạn' });

    // Check lock: if participation activity's related hoat_dong has ended, block CBL approval
    const [hRows] = await pool.execute(
      `SELECT hd.tg_ket_thuc FROM hoat_dong_tham_du hdt
       LEFT JOIN hoat_dong hd ON hdt.id_hd = hd.id_hd
       WHERE hdt.id_hd_tham_du = ? LIMIT 1`,
      [id_hd]
    );
    if (hRows && hRows.length > 0 && hRows[0].tg_ket_thuc) {
      const endTs = new Date(hRows[0].tg_ket_thuc).getTime();
      if (Date.now() > endTs) {
        return res.status(403).json({ message: 'Quyền duyệt đã bị khóa (hết thời gian)' });
      }
    }

    if (typeof trang_thai !== 'number' || ![0, 1, -1].includes(trang_thai)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const [exist] = await pool.execute('SELECT ma_sv FROM dki_tham_du WHERE id_hd = ? AND ma_sv = ? LIMIT 1', [id_hd, ma_sv]);
    if (!exist || exist.length === 0) return res.status(404).json({ message: 'Đăng ký không tồn tại' });

    await pool.execute('UPDATE dki_tham_du SET trang_thai = ? WHERE id_hd = ? AND ma_sv = ?', [trang_thai, id_hd, ma_sv]);
    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    console.error('PUT /api/dki-tham-du/:ma_sv/:id_hd error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE /api/dki-tham-du/:ma_sv/:id_hd - Student cancels participation registration
app.delete('/api/dki-tham-du/:ma_sv/:id_hd', auth, async (req, res) => {
  try {
    const { ma_sv, id_hd } = req.params;
    const currentUser = req.user.ma_ca_nhan;

    // Only the student who registered can cancel, or admin
    const role = (req.user.role || '').toLowerCase();
    if (currentUser !== ma_sv && !role.includes('admin')) {
      return res.status(403).json({ message: 'Không có quyền hủy đăng ký này' });
    }

    await pool.execute(
      'DELETE FROM dki_tham_du WHERE ma_sv = ? AND id_hd = ?',
      [ma_sv, id_hd]
    );
    res.json({ message: 'Đã hủy đăng ký tham dự' });
  } catch (err) {
    console.error('DELETE /api/dki-tham-du/:ma_sv/:id_hd error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


// ===== DANG_KY_THI CRUD (Student Registration) =====
// Helper: Generate random 6-digit join code
function generateJoinCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

// GET /api/dang-ky-thi - Get all registrations for current student or admin view
app.get('/api/dang-ky-thi', auth, async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    const ma_sv = req.user.ma_ca_nhan;

    if (role === 'admin' || role.includes('admin')) {
      // Admin sees all registrations
      const [rows] = await pool.execute(
        `SELECT dkt.id, dkt.id_hd, hd.ten_hd, hdt.hinh_thuc as configured_hinh_thuc, 
                dkt.hinh_thuc, dkt.ma_sv, sv.ho_ten, dkt.ten_nhom, dkt.ma_tham_gia, dkt.trang_thai
         FROM dang_ky_thi dkt
         LEFT JOIN hoat_dong_thi hdt ON dkt.id_hd = hdt.id_hd
         LEFT JOIN hoat_dong hd ON hdt.id_hd = hd.id_hd
         LEFT JOIN sinh_vien sv ON dkt.ma_sv = sv.ma_sinh_vien
         LEFT JOIN tai_khoan tk ON sv.ma_sinh_vien = tk.ma_ca_nhan
         ORDER BY hd.tg_bat_dau DESC`
      );
      return res.json(rows || []);
    }

    // Students see their own registrations (either they registered individually or belong to a group)
    const [rows] = await pool.execute(
      `SELECT dkt.id, dkt.id_hd, hd.ten_hd, hdt.hinh_thuc as configured_hinh_thuc,
              dkt.hinh_thuc, dkt.ma_sv, dkt.ten_nhom, dkt.ma_tham_gia, dkt.trang_thai
       FROM dang_ky_thi dkt
       LEFT JOIN hoat_dong_thi hdt ON dkt.id_hd = hdt.id_hd
       LEFT JOIN hoat_dong hd ON hdt.id_hd = hd.id_hd
       WHERE dkt.ma_sv = ? OR (dkt.ten_nhom IS NOT NULL AND dkt.ten_nhom IN (
         SELECT tvm.ten_nhom FROM thanh_vien_nhom tvm WHERE tvm.ma_sv = ?
       ))
       ORDER BY hd.tg_bat_dau DESC`,
      [ma_sv, ma_sv]
    );
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/dang-ky-thi error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/dang-ky-thi - Register for an activity (individual or group)
app.post('/api/dang-ky-thi', auth, async (req, res) => {
  try {
    const ma_sv = req.user.ma_ca_nhan;
    const { id_hd, hinh_thuc, ten_nhom, ma_tham_gia } = req.body || {};

    if (!id_hd || !hinh_thuc) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: id_hd, hinh_thuc' });
    }

    // Validate hinh_thuc
    if (!['Cá nhân', 'Nhóm'].includes(hinh_thuc)) {
      return res.status(400).json({ message: 'Hình thức đăng ký không hợp lệ' });
    }

    // Check if activity exists and get configured hinh_thuc
    const [hdtRows] = await pool.execute(
      'SELECT id_hd, hinh_thuc FROM hoat_dong_thi WHERE id_hd = ? LIMIT 1',
      [id_hd]
    );
    if (!hdtRows || hdtRows.length === 0) {
      return res.status(404).json({ message: 'Hoạt động thi không tồn tại' });
    }

    // Cross-check: if student already registered for exam (dang_ky_thi) for same id_hd, block
    const [conflict] = await pool.execute('SELECT ma_sv FROM dki_tham_du WHERE id_hd = ? AND ma_sv = ? LIMIT 1', [id_hd, ma_sv]);
    if (conflict && conflict.length > 0) return res.status(400).json({ message: 'Bạn đã đăng ký tham dự hoạt động này, không thể đăng ký thi cùng hoạt động' });

    // If registering individually
    if (hinh_thuc === 'Cá nhân') {
      // Check if this student already registered
      const [exist] = await pool.execute(
        'SELECT id FROM dang_ky_thi WHERE id_hd = ? AND ma_sv = ? LIMIT 1',
        [id_hd, ma_sv]
      );
      if (exist && exist.length > 0) {
        return res.status(400).json({ message: 'Bạn đã đăng ký hoạt động này rồi' });
      }

      await pool.execute(
        'INSERT INTO dang_ky_thi (id_hd, hinh_thuc, ma_sv, trang_thai) VALUES (?, ?, ?, ?)',
        [id_hd, 'Cá nhân', ma_sv, 0]
      );

      return res.status(201).json({
        message: 'Đăng ký cá nhân thành công. Chờ duyệt từ BTC.',
        hinh_thuc: 'Cá nhân'
      });
    }

    // If registering as group leader (creating new group)
    if (hinh_thuc === 'Nhóm' && !ma_tham_gia) {
      if (!ten_nhom) {
        return res.status(400).json({ message: 'Tên nhóm không được để trống' });
      }

      // Check if group name already exists
      const [existGroup] = await pool.execute(
        'SELECT id FROM dang_ky_thi WHERE ten_nhom = ? AND id_hd = ? LIMIT 1',
        [ten_nhom, id_hd]
      );
      if (existGroup && existGroup.length > 0) {
        return res.status(400).json({ message: 'Tên nhóm này đã tồn tại trong hoạt động' });
      }

      // Generate random join code
      const ma_tham_gia_new = generateJoinCode();

      const [result] = await pool.execute(
        'INSERT INTO dang_ky_thi (id_hd, hinh_thuc, ma_sv, ten_nhom, ma_tham_gia, trang_thai) VALUES (?, ?, ?, ?, ?, ?)',
        [id_hd, 'Nhóm', ma_sv, ten_nhom, ma_tham_gia_new, 0]
      );

      // Add group leader as first member of thanh_vien_nhom
      await pool.execute(
        'INSERT INTO thanh_vien_nhom (ten_nhom, ma_sv) VALUES (?, ?)',
        [ten_nhom, ma_sv]
      );

      return res.status(201).json({
        message: 'Tạo nhóm thành công!',
        id_dang_ky: result.insertId,
        ten_nhom: ten_nhom,
        ma_tham_gia: ma_tham_gia_new,
        hinh_thuc: 'Nhóm'
      });
    }

    // If joining existing group
    if (hinh_thuc === 'Nhóm' && ma_tham_gia) {
      // Find the group
      const [groupRows] = await pool.execute(
        'SELECT id, ma_sv, ten_nhom FROM dang_ky_thi WHERE id_hd = ? AND ma_tham_gia = ? LIMIT 1',
        [id_hd, ma_tham_gia]
      );

      if (!groupRows || groupRows.length === 0) {
        return res.status(404).json({ message: 'Mã tham gia không hợp lệ hoặc nhóm không tồn tại' });
      }

      const group = groupRows[0];

      // Check if student already in group (match by ten_nhom)
      const [inGroup] = await pool.execute(
        'SELECT ma_sv FROM thanh_vien_nhom WHERE ten_nhom = ? AND ma_sv = ? LIMIT 1',
        [group.ten_nhom, ma_sv]
      );
      if (inGroup && inGroup.length > 0) {
        return res.status(400).json({ message: 'Bạn đã tham gia nhóm này rồi' });
      }

      // Add student to group members (store ten_nhom and ma_sv)
      await pool.execute(
        'INSERT INTO thanh_vien_nhom (ten_nhom, ma_sv) VALUES (?, ?)',
        [group.ten_nhom, ma_sv]
      );

      return res.status(201).json({
        message: `Bạn đã tham gia nhóm "${group.ten_nhom}" thành công`,
        ten_nhom: group.ten_nhom,
        ma_tham_gia: ma_tham_gia
      });
    }

    res.status(400).json({ message: 'Yêu cầu không hợp lệ' });
  } catch (err) {
    console.error('POST /api/dang-ky-thi error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/dang-ky-thi/:id - Get registration details
app.get('/api/dang-ky-thi/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT dkt.id, dkt.id_hd, dkt.hinh_thuc, dkt.ma_sv, dkt.ten_nhom, dkt.ma_tham_gia, dkt.trang_thai
       FROM dang_ky_thi dkt WHERE dkt.id = ? LIMIT 1`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Đăng ký không tồn tại' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/dang-ky-thi/:id error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/dang-ky-thi/:id - Update registration status (BTC/Admin only)
app.put('/api/dang-ky-thi/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body || {};

    if (typeof trang_thai !== 'number' || ![0, 1, -1].includes(trang_thai)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ (0, 1, -1)' });
    }

    const [exist] = await pool.execute(
      'SELECT id FROM dang_ky_thi WHERE id = ? LIMIT 1',
      [id]
    );
    if (!exist || exist.length === 0) {
      return res.status(404).json({ message: 'Đăng ký không tồn tại' });
    }

    await pool.execute(
      'UPDATE dang_ky_thi SET trang_thai = ? WHERE id = ?',
      [trang_thai, id]
    );

    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    console.error('PUT /api/dang-ky-thi/:id error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/dang-ky-thi/btc/all - BTC gets all registrations
app.get('/api/dang-ky-thi/btc/all', auth, async (req, res) => {
  try {
    const ma_ca_nhan = req.user.ma_ca_nhan;
    const isBtc = await isUserBtc(ma_ca_nhan);
    const cblInfo = await isUserCbl(ma_ca_nhan);

    // If caller is BTC, return all registrations
    if (isBtc) {
      const [rows] = await pool.execute(
        `SELECT dkt.id, dkt.id_hd, hd.ten_hd, hdt.hinh_thuc as configured_hinh_thuc, 
                dkt.hinh_thuc, dkt.ma_sv, tk.ho_ten, dkt.ten_nhom, dkt.ma_tham_gia, dkt.trang_thai,
                sv.lop
         FROM dang_ky_thi dkt
         LEFT JOIN hoat_dong_thi hdt ON dkt.id_hd = hdt.id_hd
         LEFT JOIN hoat_dong hd ON hdt.id_hd = hd.id_hd
         LEFT JOIN tai_khoan tk ON dkt.ma_sv = tk.ma_ca_nhan
         LEFT JOIN sinh_vien sv ON dkt.ma_sv = sv.ma_sinh_vien
         ORDER BY hd.tg_bat_dau DESC`
      );
      return res.json(rows || []);
    }

    // If caller is CBL, return registrations related to their class only
    if (cblInfo && cblInfo.isCbl) {
      const lop = cblInfo.lop;
      const [rows] = await pool.execute(
        `SELECT DISTINCT dkt.id, dkt.id_hd, hd.ten_hd, hdt.hinh_thuc as configured_hinh_thuc,
                dkt.hinh_thuc, dkt.ma_sv, tk.ho_ten, dkt.ten_nhom, dkt.ma_tham_gia, dkt.trang_thai,
                sv.lop, sv2.lop as lop_thanh_vien
         FROM dang_ky_thi dkt
         LEFT JOIN hoat_dong_thi hdt ON dkt.id_hd = hdt.id_hd
         LEFT JOIN hoat_dong hd ON hdt.id_hd = hd.id_hd
         LEFT JOIN tai_khoan tk ON dkt.ma_sv = tk.ma_ca_nhan
         LEFT JOIN sinh_vien sv ON dkt.ma_sv = sv.ma_sinh_vien
         LEFT JOIN thanh_vien_nhom tv ON dkt.ten_nhom = tv.ten_nhom
         LEFT JOIN sinh_vien sv2 ON tv.ma_sv = sv2.ma_sinh_vien
         WHERE sv.lop = ? OR sv2.lop = ?
         ORDER BY hd.tg_bat_dau DESC`,
        [lop, lop]
      );
      return res.json(rows || []);
    }

    return res.status(403).json({ message: 'Không có quyền truy cập' });
  } catch (err) {
    console.error('GET /api/dang-ky-thi/btc/all error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE /api/dang-ky-thi/:id - Cancel registration
app.delete('/api/dang-ky-thi/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const ma_sv = req.user.ma_ca_nhan;

    // Get registration
    const [regRows] = await pool.execute(
      'SELECT id, ma_sv, ten_nhom FROM dang_ky_thi WHERE id = ? LIMIT 1',
      [id]
    );

    if (!regRows || regRows.length === 0) {
      return res.status(404).json({ message: 'Đăng ký không tồn tại' });
    }

    const reg = regRows[0];

    // Check permission: only owner or member can delete
    if (reg.ma_sv !== ma_sv) {
      // Check if student is group member (match by ten_nhom)
      const [member] = await pool.execute(
        'SELECT ma_sv FROM thanh_vien_nhom WHERE ten_nhom = ? AND ma_sv = ? LIMIT 1',
        [reg.ten_nhom, ma_sv]
      );
      if (!member || member.length === 0) {
        return res.status(403).json({ message: 'Không có quyền hủy đăng ký này' });
      }
    }

    // Delete from thanh_vien_nhom if group (remove this student from the group)
    if (reg.ten_nhom) {
      await pool.execute(
        'DELETE FROM thanh_vien_nhom WHERE ten_nhom = ? AND ma_sv = ?',
        [reg.ten_nhom, ma_sv]
      );
    }

    // If group leader, delete entire registration and all members; else just remove member
    if (reg.ma_sv === ma_sv) {
      // If leader, remove all members for that group name
      if (reg.ten_nhom) {
        await pool.execute('DELETE FROM thanh_vien_nhom WHERE ten_nhom = ?', [reg.ten_nhom]);
      }
      await pool.execute('DELETE FROM dang_ky_thi WHERE id = ?', [id]);
      res.json({ message: 'Hủy đăng ký thành công' });
    } else {
      res.json({ message: 'Rời khỏi nhóm thành công' });
    }
  } catch (err) {
    console.error('DELETE /api/dang-ky-thi/:id error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/thanh-vien-nhom/:id_or_ten_nhom - Get group members by registration id or group name
app.get('/api/thanh-vien-nhom/:id_or_ten_nhom', auth, async (req, res) => {
  try {
    const { id_or_ten_nhom } = req.params;
    let ten_nhom = id_or_ten_nhom;

    // If numeric id provided, lookup the registration to get the group name
    if (/^\d+$/.test(String(id_or_ten_nhom))) {
      const [regRows] = await pool.execute('SELECT ten_nhom FROM dang_ky_thi WHERE id = ? LIMIT 1', [id_or_ten_nhom]);
      if (!regRows || regRows.length === 0) {
        return res.json([]);
      }
      ten_nhom = regRows[0].ten_nhom;
      if (!ten_nhom) return res.json([]);
    }

    const [rows] = await pool.execute(
      `SELECT tvm.ma_sv, tk.ho_ten, tk.email
       FROM thanh_vien_nhom tvm
       LEFT JOIN tai_khoan tk ON tvm.ma_sv = tk.ma_ca_nhan
       WHERE tvm.ten_nhom = ?`,
      [ten_nhom]
    );
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/thanh-vien-nhom/:id_or_ten_nhom error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});



// ===== DIEM_DANH (Attendance) =====
// GET /api/diem-danh
app.get('/api/diem-danh', auth, async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    const ma_sv = req.user.ma_ca_nhan;
    if (role === 'admin') {
      const [rows] = await pool.execute('SELECT id, ma_sv, id_hd AS id_hd_tham_du, trang_thai, thoi_gian, anh_minh_chung FROM diem_danh ORDER BY thoi_gian DESC');
      return res.json(rows || []);
    }
    const [rows] = await pool.execute('SELECT id, ma_sv, id_hd AS id_hd_tham_du, trang_thai, thoi_gian, anh_minh_chung FROM diem_danh WHERE ma_sv = ? ORDER BY thoi_gian DESC', [ma_sv]);
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/diem-danh error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/diem-danh/activity/:id_hd_tham_du - get attendance records for a specific activity
app.get('/api/diem-danh/activity/:id_hd_tham_du', auth, async (req, res) => {
  try {
    const { id_hd_tham_du } = req.params;
    const [rows] = await pool.execute(
      `SELECT dd.id, dd.ma_sv, tk.ho_ten, sv.lop, dd.trang_thai, dd.thoi_gian, dd.anh_minh_chung
             FROM diem_danh dd
              LEFT JOIN tai_khoan tk ON dd.ma_sv = tk.ma_ca_nhan
              LEFT JOIN sinh_vien sv ON dd.ma_sv = sv.ma_sinh_vien
             WHERE dd.id_hd = ?
             ORDER BY dd.thoi_gian DESC`,
      [id_hd_tham_du]
    );
    res.json(rows || []);
  } catch (err) {
    console.error('GET /api/diem-danh/activity/:id_hd_tham_du error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/diem-danh - body: { id_hd_tham_du, anh_minh_chung, ma_sv? }
app.post('/api/diem-danh', auth, async (req, res) => {
  try {
    const { id_hd_tham_du, anh_minh_chung, ma_sv: providedMa } = req.body || {};
    if (!id_hd_tham_du || !anh_minh_chung) return res.status(400).json({ message: 'Thiếu id_hd_tham_du hoặc ảnh minh chứng' });
    const ma_sv = providedMa && String(providedMa).trim() ? String(providedMa).trim() : req.user.ma_ca_nhan;
    const [hdtRows] = await pool.execute('SELECT id_hd_tham_du FROM hoat_dong_tham_du WHERE id_hd_tham_du = ? LIMIT 1', [id_hd_tham_du]);
    if (!hdtRows || hdtRows.length === 0) return res.status(404).json({ message: 'Hoạt động tham dự không tồn tại' });
    const [exist] = await pool.execute('SELECT id FROM diem_danh WHERE id_hd = ? AND ma_sv = ? LIMIT 1', [id_hd_tham_du, ma_sv]);
    if (exist && exist.length > 0) return res.status(400).json({ message: 'Bạn đã điểm danh cho hoạt động này' });
    await pool.execute('INSERT INTO diem_danh (ma_sv, id_hd, trang_thai, thoi_gian, anh_minh_chung) VALUES (?, ?, ?, NOW(), ?)', [ma_sv, id_hd_tham_du, 0, anh_minh_chung]);
    res.status(201).json({ message: 'Đã gửi yêu cầu điểm danh. Chờ duyệt.' });
  } catch (err) {
    console.error('POST /api/diem-danh error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/diem-danh/:id - approve/reject attendance (trang_thai: 1 approved, -1 rejected)
app.put('/api/diem-danh/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body || {};
    if (typeof trang_thai !== 'number' || ![1, -1].includes(trang_thai)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    const ma = req.user && req.user.ma_ca_nhan;
    const isBtcUser = await isUserBtc(ma);
    const isAdmin = (req.user.role || '').toLowerCase() === 'admin';
    if (!isAdmin && !isBtcUser) {
      return res.status(403).json({ message: 'Không có quyền duyệt điểm danh' });
    }
    const [rows] = await pool.execute('SELECT id FROM diem_danh WHERE id = ? LIMIT 1', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Bản ghi điểm danh không tồn tại' });
    await pool.execute('UPDATE diem_danh SET trang_thai = ? WHERE id = ?', [trang_thai, id]);
    res.json({ message: 'Cập nhật trạng thái điểm danh thành công' });
  } catch (err) {
    console.error('PUT /api/diem-danh/:id error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


// DELETE /api/diem-danh/:id
app.delete('/api/diem-danh/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const uid = req.user.ma_ca_nhan;
    const role = (req.user.role || '').toLowerCase();
    const [rows] = await pool.execute('SELECT id, ma_sv, trang_thai FROM diem_danh WHERE id = ? LIMIT 1', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Bản ghi điểm danh không tồn tại' });
    const rec = rows[0];
    if (role !== 'admin' && rec.ma_sv !== uid) return res.status(403).json({ message: 'Không có quyền hủy điểm danh này' });
    if (rec.trang_thai === 1) return res.status(400).json({ message: 'Không thể hủy điểm danh đã được duyệt' });
    await pool.execute('DELETE FROM diem_danh WHERE id = ?', [id]);
    res.json({ message: 'Đã hủy điểm danh' });
  } catch (err) {
    console.error('DELETE /api/diem-danh/:id error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// --- New: Export approved attendance CSV (server-side) ---
app.get('/api/diem-danh/export', auth, async (req, res) => {
  try {
    console.log('[DEBUG] GET /api/diem-danh/export called, query=', req.query, 'user=', req.user && req.user.ma_ca_nhan);

    const ma = req.user && req.user.ma_ca_nhan;
    const isBtcUser = await isUserBtc(ma);
    const isAdmin = (req.user.role || '').toLowerCase() === 'admin';
    if (!isAdmin && !isBtcUser) {
      return res.status(403).json({ message: 'Không có quyền xuất điểm danh' });
    }

    const { filename = 'diem_danh_duyet_v2.csv', fields = '', id_hd, trang_thai } = req.query || {};
    const selectedFields = Array.isArray(fields) ? fields : String(fields).split(',').map(f => f.trim()).filter(f => f);

    // Cho phép các trường bao gồm tên hoạt động và tên sinh viên
    const allowedFields = ['id', 'ma_sv', 'ho_ten', 'id_hd', 'ten_hd', 'thoi_gian', 'trang_thai', 'anh_minh_chung'];
    const exportFields = selectedFields.length > 0 ? selectedFields.filter(f => allowedFields.includes(f)) : allowedFields;
    if (exportFields.length === 0) {
      return res.status(400).json({ message: 'Không có trường hợp lệ để xuất' });
    }

    // Map key -> label tiếng Việt (dùng cho header CSV)
    const fieldLabels = {
      id: 'ID',
      ma_sv: 'Mã sinh viên',
      ho_ten: 'Tên sinh viên',
      id_hd: 'ID hoạt động',
      ten_hd: 'Tên hoạt động',
      thoi_gian: 'Thời gian',
      trang_thai: 'Trạng thái',
      anh_minh_chung: 'Ảnh minh chứng'
    };

    // Build SELECT columns (alias nếu cần)
    const selectColumns = exportFields.map(f => {
      if (f === 'ho_ten') return 'COALESCE(tk.ho_ten, sv.ho_ten) AS ho_ten';
      if (f === 'ten_hd') return 'hd.ten_hd AS ten_hd';
      return `dd.${f}`;
    }).join(', ');

    // SQL với LEFT JOIN để tránh mất bản ghi khi liên quan bị thiếu
    let sql = `
      SELECT ${selectColumns}
      FROM diem_danh dd
      LEFT JOIN tai_khoan tk ON dd.ma_sv = tk.ma_ca_nhan
      LEFT JOIN sinh_vien sv ON dd.ma_sv = sv.ma_sinh_vien
      LEFT JOIN hoat_dong_tham_du hd ON dd.id_hd = hd.id_hd_tham_du
      WHERE 1=1
    `;

    const params = [];
    // Nếu có param trang_thai -> dùng; nếu không -> mặc định chỉ lấy đã duyệt
    if (typeof trang_thai !== 'undefined' && String(trang_thai).trim() !== '') {
      sql += ' AND dd.trang_thai = ?';
      params.push(Number(trang_thai));
    } else {
      sql += ' AND dd.trang_thai = 1';
    }

    if (typeof id_hd !== 'undefined' && id_hd !== null && String(id_hd).trim() !== '') {
      sql += ' AND dd.id_hd = ?';
      params.push(id_hd);
    }

    sql += ' ORDER BY dd.thoi_gian DESC';

    console.debug('[DEBUG] export SQL:', sql, 'params=', params);

    const [rows] = await pool.execute(sql, params);

    console.debug('[DEBUG] export rows count=', Array.isArray(rows) ? rows.length : 0);
    if (Array.isArray(rows) && rows.length > 0) {
      console.debug('[DEBUG] sample row:', rows[0]);
    }

    // Build CSV lines (header + rows)
    const csvLines = [];
    // Header: dùng label tiếng Việt (theo order exportFields)
    csvLines.push(exportFields.map(f => fieldLabels[f] || f).join(','));

    for (const row of rows) {
      const line = exportFields.map(f => {
        let val = row[f];

        // Convert special fields to readable strings
        if (f === 'anh_minh_chung') {
          val = (val && val.length > 0) ? 'Có' : 'Không';
        }
        if (f === 'trang_thai') {
          if (val === 1) val = 'Đã duyệt';
          else if (val === -1) val = 'Từ chối';
          else val = 'Chưa duyệt';
        }

        // If value is a Date object (mysql returns Date or string), convert to ISO/local string
        if (val instanceof Date) {
          val = val.toISOString();
        }

        if (val === null || val === undefined) val = '';

        // Escape if necessary: wrap in double quotes and escape inner quotes
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r'))) {
          val = `"${val.replace(/"/g, '""')}"`;
        }

        return val;
      }).join(',');
      csvLines.push(line);
    }

    // Join with CRLF and prepend UTF-8 BOM so Excel (Windows) mở đúng encoding
    const csvContent = csvLines.join('\r\n');
    const bom = '\uFEFF';
    const out = bom + csvContent;
    const buf = Buffer.from(out, 'utf8');

    // Use RFC 5987 filename* to support UTF-8 filenames
    const safeFilename = encodeURIComponent(filename);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${safeFilename}`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Length', buf.length);

    return res.send(buf);

  } catch (err) {
    console.error('GET /api/diem-danh/export error:', err?.stack || err);
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ message: 'Lỗi server', error: err?.message || String(err) });
    }
    return res.status(500).json({ message: 'Lỗi server' });
  }
});

app.listen(PORT, () => {
  console.log(`NVSP auth server listening on http://localhost:${PORT}`);
});
