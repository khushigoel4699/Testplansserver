# Azure DevOps Test Plans REST API Server

This document describes how to host and use the Azure DevOps Test Plans functionality as a REST API server.

## Overview

The server exposes all Azure DevOps Test Plans functionality through RESTful HTTP endpoints, allowing you to integrate test plan management into any application or service.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Ensure your `.env` file contains:

```bash
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-organization
AZURE_DEVOPS_PROJECT=your-project-name
AZURE_DEVOPS_PAT=your-personal-access-token
PORT=3000  # Optional, defaults to 3000
```

### 3. Start the Server

```bash
# Development mode (with TypeScript)
npm run server

# Production mode (compiled JavaScript)
npm run server:build
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Authentication
All requests are authenticated using the server's configured Azure DevOps credentials. No additional authentication is required for API calls.

---

### Health Check

#### `GET /health`
Check server health and initialization status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "clientInitialized": true
}
```

---

### Documentation

#### `GET /`
Get API documentation and available endpoints.

**Response:**
```json
{
  "message": "Azure DevOps Test Plans API Server",
  "version": "1.0.0",
  "endpoints": { ... },
  "documentation": "See README.md for detailed API documentation"
}
```

---

## Test Plans API

### Get All Test Plans

#### `GET /api/testplans`

**Query Parameters:**
- `filterActivePlans` (boolean, default: true) - Filter to include only active test plans
- `includePlanDetails` (boolean, default: false) - Include detailed information

**Example:**
```bash
curl "http://localhost:3000/api/testplans?filterActivePlans=true&includePlanDetails=false"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Sprint 1 Test Plan",
      "state": "Active",
      "iteration": "MyProject\\Sprint 1",
      "areaPath": "MyProject",
      "description": "Test plan for Sprint 1"
    }
  ],
  "count": 1,
  "filters": {
    "filterActivePlans": true,
    "includePlanDetails": false
  }
}
```

### Get Test Plan by ID

#### `GET /api/testplans/:id`

**Parameters:**
- `id` (number) - Test plan ID

**Example:**
```bash
curl "http://localhost:3000/api/testplans/123"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Sprint 1 Test Plan",
    "state": "Active",
    "iteration": "MyProject\\Sprint 1",
    "areaPath": "MyProject",
    "description": "Test plan for Sprint 1",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z",
    "owner": {
      "displayName": "John Doe"
    }
  }
}
```

### Create Test Plan

#### `POST /api/testplans`

**Request Body:**
```json
{
  "name": "New Test Plan",
  "iteration": "MyProject\\Sprint 2",
  "description": "Optional description",
  "startDate": "2024-02-01",
  "endDate": "2024-02-28",
  "areaPath": "MyProject\\Area1"
}
```

**Required Fields:**
- `name` (string) - Test plan name
- `iteration` (string) - Iteration path

**Example:**
```bash
curl -X POST "http://localhost:3000/api/testplans" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Plan",
    "iteration": "MyProject\\Sprint 1",
    "description": "Created via API"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 124,
    "name": "API Test Plan",
    "iteration": "MyProject\\Sprint 1",
    "description": "Created via API",
    "state": "Active"
  },
  "message": "Test plan created successfully"
}
```

### Update Test Plan

#### `PUT /api/testplans/:id`

**Parameters:**
- `id` (number) - Test plan ID

**Request Body:**
```json
{
  "name": "Updated Test Plan Name",
  "iteration": "MyProject\\Sprint 1",
  "description": "Updated description"
}
```

**Required Fields:**
- `iteration` (string) - Iteration path (required for updates)

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/testplans/124" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated API Test Plan",
    "iteration": "MyProject\\Sprint 1",
    "description": "Updated via API"
  }'
```

### Delete Test Plan

#### `DELETE /api/testplans/:id`

**Parameters:**
- `id` (number) - Test plan ID

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/testplans/124"
```

**Response:**
```json
{
  "success": true,
  "message": "Test plan deleted successfully"
}
```

---

## Test Cases API

### Create Test Case

#### `POST /api/testcases`

**Request Body:**
```json
{
  "title": "Test Case Title",
  "steps": "1. First step|Expected result\n2. Second step|Expected result",
  "priority": 1,
  "areaPath": "MyProject\\Area1",
  "iterationPath": "MyProject\\Sprint 1"
}
```

**Required Fields:**
- `title` (string) - Test case title

**Steps Format:**
Use the format: `"1. Step description|Expected result\n2. Next step|Next expected result"`

**Example:**
```bash
curl -X POST "http://localhost:3000/api/testcases" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login Test Case",
    "steps": "1. Open login page|Login page displays\n2. Enter credentials|User logs in successfully",
    "priority": 2
  }'
```

### Add Test Cases to Suite

#### `POST /api/testplans/:planId/suites/:suiteId/testcases`

**Parameters:**
- `planId` (number) - Test plan ID
- `suiteId` (number) - Test suite ID

**Request Body:**
```json
{
  "testCaseIds": ["123", "124", "125"]
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/testplans/100/suites/200/testcases" \
  -H "Content-Type: application/json" \
  -d '{
    "testCaseIds": ["123", "124"]
  }'
```

### Get Test Cases from Suite

#### `GET /api/testplans/:planId/suites/:suiteId/testcases`

**Parameters:**
- `planId` (number) - Test plan ID
- `suiteId` (number) - Test suite ID

**Example:**
```bash
curl "http://localhost:3000/api/testplans/100/suites/200/testcases"
```

---

## Test Results API

### Get Test Results for Build

#### `GET /api/builds/:buildId/testresults`

**Parameters:**
- `buildId` (number) - Build ID

**Example:**
```bash
curl "http://localhost:3000/api/builds/456/testresults"
```

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/testplans/invalid"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad Request (validation errors)
- `404` - Resource not found
- `500` - Internal server error

---

## Using from Another Project

### 1. Install a HTTP Client

```bash
# Node.js
npm install node-fetch
# or axios
npm install axios

# Browser - use built-in fetch()
```

### 2. Create API Client

Use the provided `api-client-example.ts` as a starting point:

```typescript
import { AzureDevOpsApiClient } from './api-client-example';

const client = new AzureDevOpsApiClient('http://localhost:3000');

// Get all test plans
const testPlans = await client.getAllTestPlans();

// Create a test plan
const newPlan = await client.createTestPlan({
  name: 'My Test Plan',
  iteration: 'Project\\Sprint 1'
});
```

### 3. Example Integration

```javascript
// JavaScript/Node.js example
const fetch = require('node-fetch');

async function getTestPlans() {
  const response = await fetch('http://localhost:3000/api/testplans');
  const data = await response.json();
  
  if (data.success) {
    console.log('Test Plans:', data.data);
  } else {
    console.error('Error:', data.error);
  }
}

// Python example
import requests

def get_test_plans():
    response = requests.get('http://localhost:3000/api/testplans')
    data = response.json()
    
    if data['success']:
        print('Test Plans:', data['data'])
    else:
        print('Error:', data['error'])

# C# example
using System.Net.Http;
using System.Text.Json;

var client = new HttpClient();
var response = await client.GetAsync("http://localhost:3000/api/testplans");
var json = await response.Content.ReadAsStringAsync();
var data = JsonSerializer.Deserialize<dynamic>(json);
```

---

## Production Deployment

### Environment Variables for Production

```bash
PORT=3000
NODE_ENV=production
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-org
AZURE_DEVOPS_PROJECT=your-project
AZURE_DEVOPS_PAT=your-production-pat
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY .env ./

EXPOSE 3000
CMD ["node", "dist/src/server.js"]
```

### Building for Production

```bash
# Build TypeScript
npm run build

# Start production server
NODE_ENV=production node dist/src/server.js
```

### Security Considerations

1. **Environment Variables**: Never commit `.env` files to source control
2. **HTTPS**: Use HTTPS in production with a reverse proxy (nginx, Apache)
3. **Rate Limiting**: Implement rate limiting for production use
4. **CORS**: Configure CORS for your specific domains
5. **PAT Security**: Use a dedicated service account with minimal permissions

---

## Troubleshooting

### Server Won't Start

1. Check environment variables are set correctly
2. Verify Azure DevOps PAT has correct permissions
3. Ensure port is not already in use

### API Calls Failing

1. Check server logs for detailed error messages
2. Verify the server is running: `GET /health`
3. Check request format matches API documentation
4. Ensure test plan/suite IDs exist in Azure DevOps

### Performance Issues

1. Enable request logging with Morgan
2. Check Azure DevOps API rate limits
3. Consider caching for frequently accessed data

---

## Available Scripts

- `npm run server` - Start development server
- `npm run server:build` - Build and start production server
- `npm run build` - Build TypeScript to JavaScript
- `npm run example` - Run client example
- `npm test` - Run tests (if implemented)

---

This REST API server provides a complete interface to Azure DevOps Test Plans functionality, making it easy to integrate test management into any application or workflow.
