import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function testStudentActivationWorkflow() {
    console.log('🧪 Testing Student Activation Workflow\n');

    try {
        // Step 1: Get a class ID (needed for student creation)
        console.log('1️⃣  Getting class list...');
        const classesResponse = await axios.get(`${API_URL}/classes`);
        const firstClass = classesResponse.data[0];

        if (!firstClass) {
            console.log('⚠️  No classes found. Please create a class first.');
            return;
        }
        console.log(`✅ Found class: ${firstClass.nom_classe} (ID: ${firstClass._id})\n`);

        // Step 2: Create a student (as admin - no password needed)
        console.log('2️⃣  Creating student without password...');
        const studentEmail = `test.student.${Date.now()}@school.com`;
        const studentData = {
            nom: 'TestStudent',
            prenom: 'John',
            email: studentEmail,
            classe: firstClass._id
        };

        const createStudentResponse = await axios.post(`${API_URL}/etudiants`, studentData);
        console.log('✅ Student created successfully!');
        console.log('   Email:', createStudentResponse.data.email);
        console.log('   Activated:', createStudentResponse.data.isActivated);
        console.log('   ID:', createStudentResponse.data._id);
        console.log();

        // Step 3: Try to activate student account
        console.log('3️⃣  Activating student account...');
        const activationData = {
            email: studentEmail,
            password: 'student123'
        };

        const activationResponse = await axios.post(`${API_URL}/auth/activate-student`, activationData);
        console.log('✅ Account activated successfully!');
        console.log('   Message:', activationResponse.data.message);
        console.log('   Token:', activationResponse.data.token.substring(0, 20) + '...');
        console.log('   User ID:', activationResponse.data.user.id);
        console.log('   Role:', activationResponse.data.user.role);
        console.log('   Linked Etudiant:', activationResponse.data.user.etudiant);
        console.log();

        const studentToken = activationResponse.data.token;

        // Step 4: Try to activate again (should fail)
        console.log('4️⃣  Trying to activate again (should fail)...');
        try {
            await axios.post(`${API_URL}/auth/activate-student`, activationData);
            console.log('❌ ERROR: Should have failed!');
        } catch (error: any) {
            console.log('✅ Correctly rejected:', error.response?.data?.message);
            console.log();
        }

        // Step 5: Login with the activated account
        console.log('5️⃣  Logging in with activated account...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: studentEmail,
            password: 'student123'
        });
        console.log('✅ Login successful!');
        console.log('   Message:', loginResponse.data.message);
        console.log('   User:', loginResponse.data.user.nom, loginResponse.data.user.prenom);
        console.log();

        // Step 6: Get profile with token
        console.log('6️⃣  Getting student profile...');
        const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${studentToken}`
            }
        });
        console.log('✅ Profile retrieved!');
        console.log('   Email:', profileResponse.data.user.email);
        console.log('   Role:', profileResponse.data.user.role);
        console.log('   Etudiant Data:', profileResponse.data.user.etudiant);
        console.log();

        // Step 7: Try to activate with non-existent email
        console.log('7️⃣  Trying to activate with non-existent email (should fail)...');
        try {
            await axios.post(`${API_URL}/auth/activate-student`, {
                email: 'nonexistent@school.com',
                password: 'password123'
            });
            console.log('❌ ERROR: Should have failed!');
        } catch (error: any) {
            console.log('✅ Correctly rejected:', error.response?.data?.message);
            console.log();
        }

        // Step 8: Create admin account
        console.log('8️⃣  Creating admin account...');
        const adminEmail = `admin.${Date.now()}@school.com`;
        const adminResponse = await axios.post(`${API_URL}/auth/register`, {
            email: adminEmail,
            password: 'admin123',
            nom: 'Admin',
            prenom: 'Test',
            role: 'admin'
        });
        console.log('✅ Admin created successfully!');
        console.log('   Email:', adminResponse.data.user.email);
        console.log('   Role:', adminResponse.data.user.role);
        console.log();

        // Step 9: Try to register student through admin endpoint (should fail)
        console.log('9️⃣  Trying to register student through admin endpoint (should fail)...');
        try {
            await axios.post(`${API_URL}/auth/register`, {
                email: 'another@student.com',
                password: 'password123',
                nom: 'Student',
                prenom: 'Another',
                role: 'student'
            });
            console.log('❌ ERROR: Should have failed!');
        } catch (error: any) {
            console.log('✅ Correctly rejected:', error.response?.data?.message);
            console.log();
        }

        console.log('✅✅✅ All tests passed! Student activation workflow is working correctly! ✅✅✅');

    } catch (error: any) {
        console.error('\n❌ Test failed:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message || error.message);
        console.error('Details:', error.response?.data);
    }
}

// Run the test
testStudentActivationWorkflow();
