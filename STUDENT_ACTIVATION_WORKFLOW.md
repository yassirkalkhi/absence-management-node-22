# Student Account Activation Workflow

This document explains how the student account activation system works.

## Overview

The system has been designed so that:
1. **Admin** creates student records with email (NO password required)
2. **Student** activates their account using their email
3. The system automatically links the User account to the existing Etudiant record

## Workflow

### Step 1: Admin Creates Student

**Endpoint:** `POST /api/etudiants`

**Request Body:**
```json
{
    "nom": "Doe",
    "prenom": "John",
    "email": "john.doe@student.com",
    "classe": "6754321abcdef123456789"
}
```

**Notes:**
- ❌ NO password field required
- ✅ Email is required and must be unique
- ✅ Student is created with `isActivated: false`

**Response (201 Created):**
```json
{
    "_id": "675abc123def456789012345",
    "nom": "Doe",
    "prenom": "John",
    "email": "john.doe@student.com",
    "classe": "6754321abcdef123456789",
    "isActivated": false
}
```

---

### Step 2: Student Activates Account

**Endpoint:** `POST /api/auth/activate-student`

**Request Body:**
```json
{
    "email": "john.doe@student.com",
    "password": "mystrongpassword123",
    "nom": "John",      // Optional - will use Etudiant data if not provided
    "prenom": "Doe"     // Optional - will use Etudiant data if not provided
}
```

**What happens:**
1. System checks if email exists in Etudiant collection
2. Verifies the student account hasn't been activated yet
3. Creates a User account with role "student"
4. Links User.etudiant to the Etudiant._id
5. Marks Etudiant.isActivated = true
6. Returns JWT token for immediate login

**Response (201 Created):**
```json
{
    "message": "Compte étudiant activé avec succès.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "675user123abc456789012345",
        "email": "john.doe@student.com",
        "nom": "John",
        "prenom": "Doe",
        "role": "student",
        "etudiant": "675abc123def456789012345"
    }
}
```

---

### Step 3: Student Logs In (Subsequent Logins)

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
    "email": "john.doe@student.com",
    "password": "mystrongpassword123"
}
```

**Response (200 OK):**
```json
{
    "message": "Connexion réussie.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "675user123abc456789012345",
        "email": "john.doe@student.com",
        "nom": "John",
        "prenom": "Doe",
        "role": "student",
        "etudiant": "675abc123def456789012345"
    }
}
```

---

## Error Scenarios

### 1. Student Not Found
**Scenario:** Email doesn't exist in Etudiant collection

**Response (404 Not Found):**
```json
{
    "message": "Aucun étudiant trouvé avec cet email. Veuillez contacter l'administrateur."
}
```

### 2. Account Already Activated
**Scenario:** Student tries to activate account twice

**Response (400 Bad Request):**
```json
{
    "message": "Ce compte étudiant a déjà été activé. Veuillez vous connecter."
}
```

### 3. User Account Already Exists
**Scenario:** User account already exists for this email

**Response (400 Bad Request):**
```json
{
    "message": "Un compte utilisateur existe déjà pour cet email."
}
```

### 4. Duplicate Email in Etudiant
**Scenario:** Admin tries to create student with existing email

**Response (400 Bad Request):**
```json
{
    "message": "E11000 duplicate key error..." // MongoDB unique constraint
}
```

---

## Admin Registration

**Endpoint:** `POST /api/auth/register`

**Note:** This endpoint is now ONLY for admin registration.

**Request Body:**
```json
{
    "email": "admin@school.com",
    "password": "adminpassword123",
    "nom": "Admin",
    "prenom": "Super",
    "role": "admin"
}
```

**Response (201 Created):**
```json
{
    "message": "Administrateur créé avec succès.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "675admin123abc456789012345",
        "email": "admin@school.com",
        "nom": "Admin",
        "prenom": "Super",
        "role": "admin"
    }
}
```

**Error if trying to register student:**
```json
{
    "message": "Cet endpoint est réservé aux comptes administrateur. Les étudiants doivent utiliser /api/auth/activate-student."
}
```

---

## Database Schema Changes

### Etudiant Model
```typescript
{
    nom: string;           // Required
    prenom: string;        // Required
    email: string;         // Required, unique, lowercase, trimmed
    classe: ObjectId;      // Required, ref: "Classe"
    isActivated: boolean;  // Default: false, set to true after activation
}
```

**Removed:**
- ❌ `password` field (no longer needed)

**Added:**
- ✅ `isActivated` field (tracks activation status)
- ✅ Email is now lowercase and trimmed automatically

### User Model
```typescript
{
    email: string;         // Required, unique, lowercase, trimmed
    password: string;      // Required, hashed with bcrypt
    nom: string;           // Required
    prenom: string;        // Required
    role: 'student' | 'admin';  // Required
    etudiant: ObjectId;    // Required if role is 'student', ref: "Etudiant"
    createdAt: Date;       // Auto-generated
    updatedAt: Date;       // Auto-generated
}
```

---

## Frontend Integration Example

### Student Registration Page

```typescript
const activateAccount = async (email: string, password: string) => {
    try {
        const response = await fetch('http://localhost:3000/api/auth/activate-student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
        } else {
            // Show error message
            alert(data.message);
        }
    } catch (error) {
        console.error('Activation error:', error);
        alert('Erreur lors de l\'activation du compte');
    }
};
```

### Admin Student Creation Page

```typescript
const createStudent = async (studentData: {
    nom: string;
    prenom: string;
    email: string;
    classe: string;
}) => {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:3000/api/etudiants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(studentData),
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Étudiant créé! Email: ${data.email}\nL'étudiant peut maintenant activer son compte.`);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Creation error:', error);
    }
};
```

---

## Security Considerations

1. ✅ **Email Validation:** Emails are automatically converted to lowercase and trimmed
2. ✅ **Duplicate Prevention:** Unique constraint on email in both Etudiant and User models
3. ✅ **Activation Check:** Students can only activate once (isActivated flag)
4. ✅ **Password Security:** Passwords are hashed with bcrypt (10 salt rounds)
5. ✅ **JWT Tokens:** Expire in 7 days
6. ✅ **Role Separation:** Admin and student registration are separate endpoints

---

## Testing the Workflow

### 1. Create a Student (as Admin)
```bash
curl -X POST http://localhost:3000/api/etudiants \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "Student",
    "email": "test@student.com",
    "classe": "YOUR_CLASS_ID"
  }'
```

### 2. Activate Student Account
```bash
curl -X POST http://localhost:3000/api/auth/activate-student \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@student.com",
    "password": "password123"
  }'
```

### 3. Login as Student
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@student.com",
    "password": "password123"
  }'
```

---

## Summary

✅ **Admin creates students** → Only email required, no password  
✅ **Students activate accounts** → Create password and link to existing record  
✅ **Automatic linking** → User.etudiant references Etudiant._id  
✅ **One-time activation** → isActivated flag prevents duplicate activations  
✅ **Secure authentication** → JWT tokens + bcrypt password hashing  
✅ **Role-based access** → Separate endpoints for admin and student registration
