# Quick Start Guide: Azure DevOps Test Plans REST API Server

## Overview
This guide shows you how to host your Azure DevOps Test Plans client as a REST API server and consume it from other projects.

## 🚀 Step-by-Step Setup

### 1. Prerequisites
- Node.js installed
- Azure DevOps Personal Access Token (PAT)
- Environment variables configured in `.env`

### 2. Install Dependencies

**Note:** If npm install fails due to registry issues, you can install packages manually or use a different registry.

```bash
# Try this first
npm install

# If that fails, you can try:
npm install --registry https://registry.npmjs.org/

# Or install the server dependencies manually:
npm install express@^4.18.2 cors@^2.8.5 helmet@^7.1.0 morgan@^1.10.0
npm install --save-dev @types/express@^4.17.21 @types/cors@^2.8.17 @types/morgan@^1.9.9
```

### 3. Start the Server

```bash
# Option 1: Development mode (recommended for testing)
npm run server

# Option 2: Build and run production mode
npm run server:build
```

### 4. Verify Server is Running

Open your browser or use curl:

```bash
# Health check
curl http://localhost:3000/health

# API documentation
curl http://localhost:3000/

# Test getting all test plans
curl http://localhost:3000/api/testplans
```

Expected output:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "clientInitialized": true
}
```

## 📡 API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/testplans` | Get all test plans |
| GET | `/api/testplans/:id` | Get test plan by ID |
| POST | `/api/testplans` | Create test plan |
| PUT | `/api/testplans/:id` | Update test plan |
| DELETE | `/api/testplans/:id` | Delete test plan |
| POST | `/api/testcases` | Create test case |
| POST | `/api/testplans/:planId/suites/:suiteId/testcases` | Add test cases to suite |
| GET | `/api/testplans/:planId/suites/:suiteId/testcases` | Get test cases from suite |
| GET | `/api/builds/:buildId/testresults` | Get test results for build |

## 🔧 Using from Another Project

### Option 1: HTTP Client (Any Language)

**JavaScript/Node.js:**
```javascript
const fetch = require('node-fetch'); // npm install node-fetch

async function getAllTestPlans() {
  const response = await fetch('http://localhost:3000/api/testplans');
  const data = await response.json();
  console.log(data);
}
```

**Python:**
```python
import requests

response = requests.get('http://localhost:3000/api/testplans')
data = response.json()
print(data)
```

**C#:**
```csharp
using System.Net.Http;
using System.Text.Json;

var client = new HttpClient();
var response = await client.GetAsync("http://localhost:3000/api/testplans");
var json = await response.Content.ReadAsStringAsync();
var data = JsonSerializer.Deserialize<dynamic>(json);
```

### Option 2: Use the Provided TypeScript Client

```bash
# Run the client example
npm run client-example
```

Or copy the `AzureDevOpsApiClient` class from `api-client-example.ts` to your project:

```typescript
import { AzureDevOpsApiClient } from './path/to/api-client-example';

const client = new AzureDevOpsApiClient('http://localhost:3000');

// Get all test plans
const testPlans = await client.getAllTestPlans();

// Create a test plan
const newPlan = await client.createTestPlan({
  name: 'My Test Plan',
  iteration: 'MyProject\\Sprint 1',
  description: 'Created from external project'
});
```

## 📋 Example API Usage

### Create a Test Plan
```bash
curl -X POST "http://localhost:3000/api/testplans" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API Test Plan",
    "iteration": "MyProject\\Sprint 1",
    "description": "Created via REST API"
  }'
```

### Get All Test Plans
```bash
curl "http://localhost:3000/api/testplans?filterActivePlans=true"
```

### Create a Test Case
```bash
curl -X POST "http://localhost:3000/api/testcases" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Case",
    "steps": "1. Call API|API responds\n2. Verify data|Data is correct",
    "priority": 2
  }'
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-organization
AZURE_DEVOPS_PROJECT=your-project-name
AZURE_DEVOPS_PAT=your-personal-access-token
PORT=3000  # Optional, defaults to 3000
```

### Update Area and Iteration Paths
Make sure to update the example values to match your Azure DevOps project:
- Replace `MyProject\\Sprint 1` with your actual iteration path
- Replace `MyProject\\Area1` with your actual area path
- Use your actual test plan/suite IDs in the examples

## 🚨 Troubleshooting

### Server Won't Start
```bash
# Check if dependencies are installed
npm install

# Check environment variables
cat .env

# Check if port is available
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux
```

### API Authentication Errors
- Verify your PAT has the correct permissions:
  - Test management (Read & Write)
  - Work items (Read & Write)
- Check that your organization URL and project name are correct

### Dependencies Installation Issues
If you can't install the Express dependencies:

1. Check your npm registry: `npm config get registry`
2. Try using the public registry: `npm install --registry https://registry.npmjs.org/`
3. Or manually create the server dependencies in your package.json

## 🎯 Next Steps

1. **Test the API**: Use the provided curl examples or Postman
2. **Integrate**: Copy the `AzureDevOpsApiClient` class to your project
3. **Customize**: Modify the server endpoints as needed
4. **Deploy**: Use Docker or your preferred hosting platform

## 📚 Full Documentation

- **API Documentation**: See `API_DOCUMENTATION.md` for complete API reference
- **Setup Guide**: See `SETUP.md` for detailed setup instructions
- **Example Usage**: Run `npm run example` for the original client demo

## 💡 Benefits of the Server Approach

1. **Language Agnostic**: Use from any language that supports HTTP
2. **Centralized Authentication**: Configure Azure DevOps credentials once
3. **Team Sharing**: Multiple projects can use the same server
4. **Scalable**: Can be deployed to cloud services
5. **Consistent API**: Standard REST endpoints for all operations

Your Azure DevOps Test Plans functionality is now available as a REST API! 🎉
