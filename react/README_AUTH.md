# React Authentication Implementation

## 🎯 Overview

This React application now includes a complete authentication system integrated with the backend JWT authentication.

## ✅ What's Been Implemented

### 1. **Authentication Context** (`src/contexts/AuthContext.tsx`)
- Global auth state management
- User information storage
- Login/logout functionality
- Persistent authentication (localStorage)

### 2. **Auth Service** (`src/services/authService.ts`)
- `login()` - Login with email/password
- `activateStudent()` - Student account activation
- `logout()` - Clear auth data
- `isAuthenticated()` - Check auth status
- Token management helpers

### 3. **API Interceptor** (`src/services/api.ts`)
- Automatically adds JWT token to all requests
- Handles 401 errors (token expiration)
- Redirects to login on auth failure

### 4. **Protected Routes** (`src/components/auth/ProtectedRoute.tsx`)
- Guards routes that require authentication
- Optional admin-only access
- Loading states
- Automatic redirect to login

### 5. **Login Page** (`src/pages/LoginPage.tsx`)
- Email/password login form
- Error handling
- Link to student activation
- Responsive design

### 6. **Student Activation Page** (`src/pages/ActivateStudentPage.tsx`)
- Student account activation form
- Password confirmation
- Password validation (min 6 chars)
- Error handling

### 7. **Dashboard Updates**
- User info display in header
- Logout button
- Role display (student/admin)

---

## 🚀 Usage

### Login Flow

1. User visits `/login`
2. Enters email and password
3. On success:
   - Token stored in localStorage
   - User data stored in localStorage
   - Redirected to dashboard (`/`)

### Student Activation Flow

1. Admin creates student (backend)
2. Student visits `/activate`
3. Enters email (provided by admin) and creates password
4. On success:
   - Account activated
   - Token stored
   - Redirected to dashboard

### Protected Routes

All dashboard routes are now protected:
- `/` - Dashboard (requires auth)
- `/absences` - Absences (requires auth)
- `/classes` - Classes (requires auth)
- `/etudiants` - Students (requires auth)
- etc.

---

## 📁 File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Auth state management
├── services/
│   ├── api.ts                   # Axios instance with interceptors
│   └── authService.ts           # Auth API calls
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx   # Route guard component
│   ├── layout/
│   │   └── DashboardLayout.tsx  # Updated with logout
│   └── ui/
│       └── alert.tsx            # Alert component
├── pages/
│   ├── LoginPage.tsx            # Login page
│   ├── ActivateStudentPage.tsx  # Student activation
│   └── ...                      # Other pages
├── types/
│   └── index.ts                 # Auth types added
└── App.tsx                      # Routes configured
```

---

## 🔐 Authentication Flow

### 1. Initial Load
```
App loads → AuthProvider checks localStorage
  ├─ Token found → Set user state → Allow access
  └─ No token → Redirect to /login
```

### 2. Login
```
User submits login form
  ├─ POST /api/auth/login
  ├─ Receive token + user data
  ├─ Store in localStorage
  ├─ Update AuthContext
  └─ Navigate to dashboard
```

### 3. API Requests
```
User makes API request
  ├─ Interceptor adds: Authorization: Bearer <token>
  ├─ Request sent
  └─ Response:
      ├─ 200 OK → Continue
      └─ 401 Unauthorized → Clear storage → Redirect to login
```

### 4. Logout
```
User clicks logout
  ├─ Clear localStorage (token + user)
  ├─ Clear AuthContext state
  └─ Navigate to /login
```

---

## 🎨 UI Components

### Login Page
- Clean, centered card layout
- Email and password inputs
- Error message display
- Link to activation page
- Loading state during submission

### Activation Page
- Similar layout to login
- Password confirmation field
- Password strength requirement (6+ chars)
- Helpful instructions
- Link back to login

### Dashboard Header
- User name display
- Role badge (student/admin)
- Logout button with icon
- Responsive design

---

## 🔧 Configuration

### Environment Variables

Make sure `.env.development` has:
```env
VITE_API_URL=http://localhost:3000/api
```

### Token Storage

Tokens are stored in `localStorage`:
- `token` - JWT token
- `user` - User object (JSON string)

---

## 🛡️ Security Features

1. **JWT Token** - Secure authentication
2. **Automatic Token Injection** - All API calls include token
3. **Token Expiration Handling** - Auto-logout on 401
4. **Protected Routes** - Unauthorized users redirected
5. **Password Validation** - Minimum 6 characters
6. **Role-Based Access** - Optional admin-only routes

---

## 📝 Example Usage

### Using Auth in Components

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
    const { user, isAuthenticated, logout } = useAuth();

    if (!isAuthenticated) {
        return <div>Not logged in</div>;
    }

    return (
        <div>
            <p>Welcome, {user?.nom} {user?.prenom}!</p>
            <p>Role: {user?.role}</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
}
```

### Making Authenticated API Calls

```typescript
import api from '@/services/api';

// Token is automatically added by interceptor
const fetchData = async () => {
    const response = await api.get('/absences');
    return response.data;
};
```

### Creating Admin-Only Routes

```typescript
<Route path="/admin-panel" element={
    <ProtectedRoute requireAdmin={true}>
        <AdminPanel />
    </ProtectedRoute>
} />
```

---

## 🧪 Testing

### Test Login
1. Start backend: `npm run dev` (in root)
2. Start frontend: `npm run dev` (in react folder)
3. Visit `http://localhost:5173/login`
4. Use admin credentials or activate a student account

### Test Student Activation
1. Create a student via backend (POST /api/etudiants)
2. Visit `http://localhost:5173/activate`
3. Enter student email and create password
4. Should redirect to dashboard on success

---

## 🚨 Troubleshooting

### "Cannot find module" errors
- Make sure all imports use `@/` alias
- Check `tsconfig.json` has correct path mapping

### 401 Errors
- Check token is being sent in headers
- Verify backend JWT_SECRET matches
- Check token hasn't expired (7 days)

### Redirect Loop
- Clear localStorage
- Check ProtectedRoute logic
- Verify AuthProvider wraps entire app

---

## 📚 Next Steps

- [ ] Add "Remember Me" functionality
- [ ] Implement password reset
- [ ] Add email verification
- [ ] Implement refresh tokens
- [ ] Add role-based UI hiding (hide admin features from students)
- [ ] Add user profile page
- [ ] Add password change functionality

---

## ✅ Summary

✅ **Login page** - Email/password authentication  
✅ **Student activation** - Self-service account creation  
✅ **Protected routes** - Auth required for dashboard  
✅ **Auto token injection** - All API calls authenticated  
✅ **Logout functionality** - Clear session  
✅ **User display** - Show current user info  
✅ **Error handling** - Graceful auth failures  
✅ **Persistent sessions** - localStorage-based  

**The React app is now fully integrated with the backend authentication system!** 🎉
