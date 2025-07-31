# 🚀 Compliance AI API Testing Guide

## Server Status
✅ **Backend Server**: Running on `http://localhost:3000`  
✅ **API Documentation**: Available at `http://localhost:3000/api/docs`  
✅ **Database**: Seeded with sample data  

## 📋 Quick Setup for Postman

### 1. Import the Collection
- Import the `Compliance_AI_API.postman_collection.json` file into Postman
- The collection includes all endpoints with sample requests

### 2. Set Collection Variables
After importing, set these variables in your collection:

```
base_url: http://localhost:3000
access_token: (will be set automatically after login)
```

### 3. Sample IDs for Testing
Use these real IDs from the seeded database:

#### 👥 Users
- **Admin User**: `1f8d48b9-16cf-41a7-876e-8137cac97d95` (admin@demo-fintech.com)
- **Compliance Officer**: `ca15b1bf-4abd-4184-809d-1e74bac22cbe` (compliance@demo-fintech.com)
- **Team Member**: `e0c1b61c-386e-409c-8f83-5505d58571ec` (sam@demo-fintech.com)

#### 📋 Frameworks
- **PCI-DSS**: `60d1a1e2-fa10-40b3-8bcc-a1a64616cf1f`
- **SOC2**: `8ad7892b-3305-44e9-9231-26c272efabb0`
- **GDPR**: `bccf43ad-7049-48bc-a803-5d2b7f53c7be`
- **ISO 27001**: `2d5030f3-e6b1-4fc0-94ef-4f20513212ca`

#### 🏢 Organization
- **Demo Fintech Company**: `203ed168-e9d5-42a4-809c-a09f5952d697`

#### 📊 Compliance Progress
- **PCI-DSS Progress**: `e92a5005-e4de-4258-961e-c02c5865f331`
- **SOC2 Progress**: `e8841ca8-794f-4309-b1aa-7fabdd566b54`
- **GDPR Progress**: `60f2157b-f45e-4561-b96b-b0f6e2dd3c6f`
- **ISO 27001 Progress**: `ab1ec742-9c47-4811-8790-50cb878618cc`

#### 📄 Documents
- **PCI-DSS Documentation**: `e07fbdc1-58ed-4a3c-a250-f80a383e088d`
- **SOC2 Audit Prep**: `73b2930c-730f-4841-8daa-11e380ca459f`
- **GDPR Privacy Policy**: `3a16c3e0-5cc7-4ccf-b5ec-8f8220d2f2fe`
- **ISO27001 Security**: `ea5afe4a-543f-4494-ad7f-f2f3fa236c63`

#### ✅ Tasks
- **Network Security Controls**: `efa35356-18ed-4a4f-863e-08e6adbe187e`
- **Access Control Measures**: `5f329daa-7ad3-4aca-b510-83e29c60d68d`
- **Risk Assessment Documentation**: `73bf887e-ec40-401c-8dd9-afc5cfe83cd2`

## 🔐 Authentication Flow

### Step 1: Login
**POST** `/auth/login`
```json
{
  "email": "admin@demo-fintech.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1f8d48b9-16cf-41a7-876e-8137cac97d95",
    "email": "admin@demo-fintech.com",
    "firstName": "Alex",
    "lastName": "Johnson",
    "role": "admin"
  }
}
```

The collection will automatically save the `access_token` for subsequent requests.

## 🧪 Testing Scenarios

### Scenario 1: Basic Data Retrieval
1. **Login** with admin credentials
2. **Get All Frameworks** - Should return 4 frameworks
3. **Get Compliance Progress** - Should show progress for all frameworks
4. **Get All Documents** - Should return 4 sample documents

### Scenario 2: Task Management
1. **Get Priority Tasks** - Should return high-priority tasks
2. **Create New Task** - Use a framework ID and progress ID
3. **Update Task Status** - Change from pending to completed
4. **Get Tasks by Progress** - Verify the new task appears

### Scenario 3: Document Management
1. **Get All Documents**
2. **Create New Document** - Use framework and organization IDs
3. **Update Document** - Change content and status
4. **Add Collaborator** - Add a user as collaborator
5. **Get Document Versions** - Should show version history

### Scenario 4: User Management
1. **Get All Users** - Should return seeded users
2. **Create New User** - Register a new team member
3. **Update User** - Modify user details

## 🔍 Expected Responses

### Successful Authentication
- **Status**: 200 OK
- **Body**: Contains `access_token` and user details

### Get Compliance Progress
- **Status**: 200 OK
- **Body**: Array of progress objects with calculated percentages

### Get Documents
- **Status**: 200 OK
- **Body**: Array of documents with collaborators and framework info

### Create Operations
- **Status**: 201 Created
- **Body**: Created entity with generated ID

### Update Operations
- **Status**: 200 OK
- **Body**: Updated entity

## 🚨 Error Scenarios to Test

### Authentication Errors
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions

### Validation Errors
- **400 Bad Request**: Invalid request body
- **422 Unprocessable Entity**: Validation failures

### Not Found Errors
- **404 Not Found**: Invalid UUIDs or non-existent resources

## 📊 API Documentation
Visit `http://localhost:3000/api/docs` for interactive Swagger documentation with:
- Complete endpoint documentation
- Request/response schemas
- Try-it-out functionality
- Authentication setup

## 🔧 Troubleshooting

### Server Not Responding
```bash
cd backend
npm run start:dev
```

### Database Issues
```bash
cd backend
npm run seed
```

### Get Fresh Sample IDs
```bash
cd backend
node get-sample-ids.js
```

## 🎯 Key Features to Test

1. **JWT Authentication** - All endpoints require valid tokens
2. **Role-based Access** - Different user roles have different permissions
3. **Data Relationships** - Documents linked to frameworks, tasks to progress
4. **Validation** - Proper error handling for invalid data
5. **Pagination** - Large datasets are properly paginated
6. **Real-time Updates** - Progress calculations update automatically

Happy testing! 🚀