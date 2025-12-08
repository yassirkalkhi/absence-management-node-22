# Authentication System - Complete Guide

## 🎯 Overview

This project implements a complete JWT-based authentication system with **role-based access control** for an absence management application.

### Features

✅ **Two User Roles**: Student and Admin  
✅ **JWT Authentication**: Secure token-based authentication  
✅ **Password Hashing**: bcrypt with 10 salt rounds  
✅ **Student Activation Workflow**: Admin creates students, students activate their own accounts  
✅ **Role-Based Access Control**: Middleware for protecting routes  
✅ **Profile Management**: Update profile and change password  

---

## 📋 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update `.env` file:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/absence_management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Start the Server

```bash
npm run dev
```

### 4. Test the System

```bash
# Test student activation workflow
npm run test:student-activation

# Test general auth system
npm run test:api
```

---

## 🔐 Authentication Endpoints

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register admin account |
| POST | `/api/auth/activate-student` | Activate student account |
| POST | `/api/auth/login` | Login (admin or student) |

### Protected Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/change-password` | Change password |

---

## 👥 User Roles

### Admin
- Can create students
- Can manage all resources
- Registers through `/api/auth/register`

### Student
- Created by admin (without password)
- Activates account through `/api/auth/activate-student`
- Can view their own absences and justifications

---

## 🔄 Student Activation Workflow

### Step 1: Admin Creates Student

```bash
POST /api/etudiants
Content-Type: application/json

{
    "nom": "Doe",
    "prenom": "John",
    "email": "john.doe@student.com",
    "classe": "CLASS_ID"
}
```

**Note:** No password required! Student is created with `isActivated: false`

### Step 2: Student Activates Account

```bash
POST /api/auth/activate-student
Content-Type: application/json

{
    "email": "john.doe@student.com",
    "password": "mystrongpassword123"
}
```

**What happens:**
1. System finds the student by email
2. Creates a User account linked to the student
3. Marks student as activated
4. Returns JWT token for immediate login

### Step 3: Student Logs In

```bash
POST /api/auth/login
Content-Type: application/json

{
    "email": "john.doe@student.com",
    "password": "mystrongpassword123"
}
```

---

## 🛡️ Protecting Routes

### Example: Protect All Routes

```typescript
import { authenticate } from '../middleware/auth';

router.get('/api/absences', authenticate, getAllAbsences);
```

### Example: Admin Only

```typescript
import { authenticate, requireAdmin } from '../middleware/auth';

router.post('/api/absences', authenticate, requireAdmin, createAbsence);
```

### Example: Student Only

```typescript
import { authenticate, requireStudent } from '../middleware/auth';

router.get('/api/absences/my-absences', authenticate, requireStudent, getMyAbsences);
```

### Example: Access User in Controller

```typescript
import { AuthRequest } from '../middleware/auth';

export const getMyAbsences = async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const etudiantId = req.user?.etudiant;
    
    // Your logic here
};
```

---

## 📁 Project Structure

```
src/
├── models/
│   ├── User.ts              # User model (authentication)
│   ├── Etudiant.ts          # Student model (updated)
│   └── ...
├── controllers/
│   ├── authController.ts    # Authentication logic
│   └── ...
├── middleware/
│   └── auth.ts              # JWT verification & role checking
├── routes/
│   ├── authRoutes.ts        # Auth endpoints
│   └── ...
└── config/
    └── db.ts                # MongoDB connection
```

---

## 🧪 Testing

### Test Student Activation Workflow

```bash
npm run test:student-activation
```

This will:
1. Create a student (no password)
2. Activate the student account
3. Verify activation can't be done twice
4. Login with the activated account
5. Get profile with JWT token
6. Test error scenarios

### Manual Testing with cURL

See `STUDENT_ACTIVATION_WORKFLOW.md` for detailed cURL examples.

---

## 🔑 API Examples

### 1. Register Admin

```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'admin@school.com',
        password: 'admin123',
        nom: 'Admin',
        prenom: 'Super',
        role: 'admin'
    })
});

const { token, user } = await response.json();
```

### 2. Activate Student Account

```javascript
const response = await fetch('http://localhost:3000/api/auth/activate-student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'student@school.com',
        password: 'student123'
    })
});

const { token, user } = await response.json();
```

### 3. Login

```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@school.com',
        password: 'password123'
    })
});

const { token, user } = await response.json();
localStorage.setItem('token', token);
```

### 4. Make Authenticated Request

```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/auth/profile', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

const { user } = await response.json();
```

---

## 🗄️ Database Models

### User Model

```typescript
{
    email: string;           // Unique, lowercase, trimmed
    password: string;        // Hashed with bcrypt
    nom: string;
    prenom: string;
    role: 'student' | 'admin';
    etudiant?: ObjectId;     // Reference to Etudiant (if student)
    createdAt: Date;
    updatedAt: Date;
}
```

### Etudiant Model (Updated)

```typescript
{
    nom: string;
    prenom: string;
    email: string;           // Unique, lowercase, trimmed
    classe: ObjectId;        // Reference to Classe
    isActivated: boolean;    // Default: false
}
```

**Changes:**
- ❌ Removed `password` field
- ✅ Added `isActivated` field
- ✅ Email is now lowercase and trimmed

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: Expire in 7 days
3. **Password Exclusion**: Password field excluded from queries by default
4. **Email Normalization**: Emails converted to lowercase and trimmed
5. **Unique Constraints**: Email must be unique in both User and Etudiant
6. **Activation Check**: Students can only activate once
7. **Role Validation**: Endpoints validate user roles

---

## 📚 Documentation Files

- `STUDENT_ACTIVATION_WORKFLOW.md` - Detailed workflow documentation
- `AUTH_USAGE_EXAMPLES.js` - Code examples and API usage
- `README_AUTH.md` - This file

---

## 🚨 Common Errors

### "Aucun étudiant trouvé avec cet email"
**Solution:** Admin must create the student first using `/api/etudiants`

### "Ce compte étudiant a déjà été activé"
**Solution:** Use `/api/auth/login` instead of `/api/auth/activate-student`

### "Token invalide ou expiré"
**Solution:** Login again to get a new token

### "Accès refusé. Droits administrateur requis"
**Solution:** This endpoint requires admin role

---

## 🎓 Next Steps

1. **Frontend Integration**: Create login and registration pages
2. **Password Reset**: Implement forgot password functionality
3. **Email Verification**: Add email verification on activation
4. **Refresh Tokens**: Implement refresh token mechanism
5. **Rate Limiting**: Add rate limiting to prevent brute force attacks

---

## 📞 Support

For questions or issues, please refer to:
- `STUDENT_ACTIVATION_WORKFLOW.md` for workflow details
- `AUTH_USAGE_EXAMPLES.js` for code examples
- Test files for implementation examples

---

## ✅ Checklist

- [x] User model with password hashing
- [x] JWT authentication
- [x] Role-based access control (student/admin)
- [x] Student activation workflow
- [x] Protected routes middleware
- [x] Profile management
- [x] Password change functionality
- [x] Comprehensive documentation
- [x] Test scripts

---

**Happy Coding! 🚀**
