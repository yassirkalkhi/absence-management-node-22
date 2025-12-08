# 🚀 Authentication Quick Reference

## 📍 Important URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Login Page**: http://localhost:5173/login
- **Activation Page**: http://localhost:5173/activate

---

## 🔑 API Endpoints

### Public (No Auth Required)
```bash
POST /api/auth/login              # Login
POST /api/auth/register           # Register admin
POST /api/auth/activate-student   # Activate student account
```

### Protected (Auth Required)
```bash
GET  /api/auth/profile            # Get user profile
PUT  /api/auth/profile            # Update profile
PUT  /api/auth/change-password    # Change password
```

---

## 💻 Code Snippets

### Login (Frontend)
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, isAuthenticated, logout } = useAuth();
```

### Make Authenticated Request
```typescript
import api from '@/services/api';

const data = await api.get('/absences');
// Token automatically included!
```

### Protect a Route
```typescript
<Route path="/admin" element={
  <ProtectedRoute requireAdmin={true}>
    <AdminPage />
  </ProtectedRoute>
} />
```

---

## 🧪 Quick Test

### 1. Create Admin
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "nom": "Admin",
    "prenom": "Test",
    "role": "admin"
  }'
```

### 2. Create Student (as Admin)
```bash
curl -X POST http://localhost:3000/api/etudiants \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Student",
    "prenom": "Test",
    "email": "student@test.com",
    "classe": "YOUR_CLASS_ID"
  }'
```

### 3. Activate Student
```bash
curl -X POST http://localhost:3000/api/auth/activate-student \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "student123"
  }'
```

### 4. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "student123"
  }'
```

---

## 📂 Key Files

### Backend
- `src/models/User.ts` - User model
- `src/models/Etudiant.ts` - Student model (updated)
- `src/controllers/authController.ts` - Auth logic
- `src/middleware/auth.ts` - JWT verification
- `src/routes/authRoutes.ts` - Auth routes
- `.env` - JWT_SECRET

### Frontend
- `src/contexts/AuthContext.tsx` - Auth state
- `src/services/authService.ts` - Auth API
- `src/services/api.ts` - Axios + interceptors
- `src/components/auth/ProtectedRoute.tsx` - Route guard
- `src/pages/LoginPage.tsx` - Login UI
- `src/pages/ActivateStudentPage.tsx` - Activation UI
- `src/App.tsx` - Routes config

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/absence_management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Frontend (.env.development)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🎯 User Roles

| Role | Can Do |
|------|--------|
| **admin** | Create students, manage all resources |
| **student** | View own absences, submit justifications |

---

## 📊 Workflow Summary

```
Admin creates student (no password)
         ↓
Student receives email notification
         ↓
Student visits /activate
         ↓
Student creates password
         ↓
Account activated & linked
         ↓
Student redirected to dashboard
         ↓
Future logins via /login
```

---

## 🛡️ Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT tokens with expiration
- [x] Protected API endpoints
- [x] Protected frontend routes
- [x] Automatic token injection
- [x] Token expiration handling
- [x] Email normalization
- [x] One-time activation

---

## 🚨 Common Issues

### "401 Unauthorized"
- Check token is valid
- Verify JWT_SECRET matches
- Token may have expired (7 days)

### "Cannot find module"
- Use `@/` alias for imports
- Check tsconfig.json paths

### "Student not found"
- Admin must create student first
- Check email matches exactly

---

## 📚 Documentation

- `README_AUTH.md` - Backend guide
- `react/README_AUTH.md` - Frontend guide
- `STUDENT_ACTIVATION_WORKFLOW.md` - Detailed workflow
- `AUTHENTICATION_COMPLETE.md` - Full summary
- `AUTH_USAGE_EXAMPLES.js` - Code examples

---

## ✅ Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] MongoDB running
- [ ] .env files configured
- [ ] First admin created
- [ ] Can login successfully
- [ ] Can create students
- [ ] Students can activate
- [ ] Protected routes working

---

**Need help? Check the documentation files!** 📖
