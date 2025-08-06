# Compliance Companion API Testing Guide

This guide will help you test the Compliance Companion API using the provided Postman collection.

## 🚀 Quick Start

### 1. Import the Postman Collection
- Open Postman
- Click "Import" → "Upload Files"
- Select `Compliance_AI_API.postman_collection.json`

### 2. Start the Backend Server
```bash
cd backend
npm run start:dev
```

The server will start on `http://localhost:3000`

### 3. Test the API Documentation
Visit: `http://localhost:3000/api/docs` to see the Swagger documentation

## 🔐 Authentication Flow

### Step 1: Login with Demo User
Use the **"Login User"** request with these credentials:
```json
{
  "email": "admin@demo-fintech.com",
  "password": "password123"
}
```

The collection will automatically save the JWT token for subsequent requests.

### Available Demo Users:
- **Admin**: `admin@demo-fintech.com` / `password123`
- **Compliance Officer**: `compliance@demo-fintech.com` / `password123`
- **Team Member**: `sam@demo-fintech.com` / `password123`
- **Team Member**: `jamie@demo-fintech.com` / `password123`

## 📋 Testing Workflow

### 1. Authentication
1. **Login User** - Get JWT token
2. **Register User** - Create new user (optional)
3. **Logout User** - Clear session

### 2. Compliance Management
1. **Get All Frameworks** - View available compliance frameworks
2. **Get Compliance Progress** - See organization's progress
3. **Get Priority Tasks** - View high-priority tasks
4. **Create Task** - Add new compliance task
5. **Update Task** - Mark tasks as completed

### 3. Document Management
1. **Get All Documents** - View all documents
2. **Get Documents by Framework** - Filter by compliance framework
3. **Create Document** - Add new compliance document
4. **Update Document** - Modify document content
5. **Get Document Versions** - View version history
6. **Add/Remove Collaborators** - Manage document access

### 4. User Management
1. **Get All Users** - View team members
2. **Get User by ID** - View specific user details
3. **Update User** - Modify user information

### 5. AI Features
1. **Generate Document** - Use AI to create compliance documents

## 🔧 Collection Variables

The collection uses these variables (automatically set):
- `base_url`: API base URL (http://localhost:3000)
- `access_token`: JWT token from login
- `user_id`: Current user ID
- `framework_id`: Selected framework ID
- `document_id`: Selected document ID
- `task_id`: Selected task ID

## 📊 Sample Data

The database is seeded with:

### Frameworks:
- **PCI-DSS**: Payment Card Industry Data Security Standard
- **SOC2**: System and Organization Controls 2
- **GDPR**: General Data Protection Regulation
- **ISO27001**: Information Security Management System

### Sample Documents:
- PCI-DSS Compliance Documentation (75% complete)
- SOC2 Type II Audit Preparation (45% complete)
- GDPR Privacy Policy (90% complete)
- ISO27001 Information Security (20% complete)

### Sample Tasks:
- Network Security Controls (High Priority, In Progress)
- Access Control Measures (Medium Priority, Pending)
- Risk Assessment Documentation (High Priority, Pending)
- Vendor Management Process (High Priority, In Progress)
- Data Processing Agreement (Medium Priority, Completed)

## 🧪 Testing Scenarios

### Scenario 1: New User Onboarding
1. Register new user
2. Login with new credentials
3. View available frameworks
4. Check compliance progress

### Scenario 2: Document Collaboration
1. Login as admin
2. Create new document
3. Add collaborators
4. Update document content
5. View version history

### Scenario 3: Task Management
1. View priority tasks
2. Create new task
3. Update task status to completed
4. Check updated compliance progress

### Scenario 4: Framework Analysis
1. Get all frameworks
2. Get progress for specific framework
3. View framework-specific documents
4. Generate AI document for framework

## 🚨 Error Handling

Common HTTP status codes:
- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **404**: Resource not found
- **500**: Internal server error

## 🔍 Debugging Tips

1. **Check Console**: Postman console shows automatic variable updates
2. **Verify Token**: Ensure JWT token is saved after login
3. **Check Variables**: Use `{{variable_name}}` syntax in requests
4. **Server Logs**: Check backend console for detailed error messages
5. **Swagger Docs**: Use `/api/docs` for endpoint documentation

## 📝 Notes

- All endpoints (except auth) require JWT authentication
- The collection automatically handles token management
- Variables are automatically updated from successful responses
- Use the pre-request script to debug authentication issues

## 🎯 Next Steps

After testing the API:
1. Integrate with your frontend application
2. Implement real-time features with WebSockets
3. Add AI integration with OpenAI/Claude APIs
4. Set up production database and deployment

Happy testing! 🚀