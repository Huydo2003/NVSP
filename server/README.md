# NVSP Auth Server (login)

This is a minimal Node.js + Express backend that authenticates users against the `taikhoan` table in your `quanlysv` MySQL database and issues JWT tokens.

Files:
- `server.js` - main Express app with `/api/login` and `/api/me`
- `db.js` - MySQL connection helper using `mysql2/promise`
- `auth.js` - JWT verification middleware
- `.env.example` - example environment variables

Setup (Windows PowerShell):

1. Open PowerShell and go to the server folder:

```powershell
cd d:\PROJECT_CODE\REACTJS\NVSP\server
```

2. Install dependencies:

```powershell
npm install
```

3. Copy `.env.example` to `.env` and fill database credentials and `JWT_SECRET`:

```powershell
copy .env.example .env
# then edit .env with your editor (Notepad/VSCode) to update DB_PASSWORD and JWT_SECRET
```

4. Start the server:

```powershell
npm run start
# or for development with auto-reload (if nodemon installed):
npm run dev
```

API:
- POST /api/login
  - Body: { "username": "admin", "password": "admin" }
  - Returns: { token, user }
- GET /api/me
  - Header: Authorization: Bearer <token>
  - Returns: authenticated user info

Notes:
- The `taikhoan` table in your SQL dump uses `matKhau` column. If the stored password is plaintext, the server supports direct plaintext compare. If passwords are bcrypt hashes, bcrypt compare is used.
- Adjust CORS, token expiry, and role mapping as needed for your application.
