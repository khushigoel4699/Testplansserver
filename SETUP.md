# How to Run the Azure DevOps Test Plans Client Project

This guide will walk you through setting up and running the Azure DevOps Test Plans Client project.

## Prerequisites

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Azure DevOps Account** with access to a project
- **Personal Access Token (PAT)** from Azure DevOps

## Setup Steps

### 1. Install Dependencies

Open PowerShell/Command Prompt in the project directory and run:

```powershell
npm install
```

This will install all required dependencies including:
- `azure-devops-node-api` - Azure DevOps REST API client
- `@azure/identity` - Azure authentication library
- `dotenv` - Environment variable management
- `typescript` and `ts-node` - TypeScript support

### 2. Configure Environment Variables

1. **Copy the example environment file:**
   ```powershell
   Copy-Item .env.example .env
   ```

2. **Edit the `.env` file** with your Azure DevOps details:

   ```bash
   # Required - Your Azure DevOps organization and project
   AZURE_DEVOPS_ORG_URL=https://dev.azure.com/YOUR_ORGANIZATION
   AZURE_DEVOPS_PROJECT=YOUR_PROJECT_NAME

   # Authentication - Use Personal Access Token (recommended)
   AZURE_DEVOPS_PAT=your_personal_access_token_here

   # Optional - For Service Principal authentication
   # AZURE_CLIENT_ID=your-client-id
   # AZURE_CLIENT_SECRET=your-client-secret
   # AZURE_TENANT_ID=your-tenant-id
   ```

### 3. Create a Personal Access Token (PAT)

1. Go to your Azure DevOps organization
2. Click on your profile picture → **Personal access tokens**
3. Click **+ New Token**
4. Configure the token:
   - **Name**: Give it a descriptive name (e.g., "Test Plans API Client")
   - **Expiration**: Set appropriate expiration date
   - **Scopes**: Select **Custom defined** and check:
     - ✅ **Test management** (Read & Write)
     - ✅ **Work items** (Read & Write)  
     - ✅ **Build** (Read) - for test results
5. Click **Create**
6. **Copy the token** and paste it in your `.env` file as `AZURE_DEVOPS_PAT`

## Running the Project

### Option 1: Run the Example Demo (Recommended)

Run the comprehensive example that demonstrates all features:

```powershell
# Using ts-node (direct TypeScript execution)
npm run example

# OR compile first then run
npm run example:build
```

### Option 2: Build and Run Individual Components

```powershell
# Build the TypeScript code
npm run build

# Run the compiled JavaScript
npm start
```

### Option 3: Development Mode

For development with auto-recompilation:

```powershell
npm run dev
```

## What the Example Does

The `example.ts` file demonstrates:

1. **Initialize the client** with authentication
2. **List all test plans** in your project
3. **Create a new test plan** with full configuration
4. **Get test plan details** by ID
5. **Create a test case** with steps and metadata
6. **Add test cases to suites** (if suites exist)
7. **Retrieve test cases** from plans and suites
8. **Update test plans** with new information
9. **Get test results** from builds (if builds exist)

## Expected Output

When you run the example, you should see output like:

```
=== Azure DevOps Test Plans Client Demo ===

1. Fetching all test plans...
Fetching all test plans...
Found 3 test plan(s):
1. Sprint 1 Test Plan (ID: 123) - State: Active
2. Integration Tests (ID: 124) - State: Active
3. UAT Test Plan (ID: 125) - State: Inactive
Retrieved 3 test plans

2. Creating a new test plan...
Creating test plan: Demo Test Plan
Test plan created successfully with ID: 126
Created test plan with ID: 126

... (continues with other examples)

=== Demo completed successfully! ===
```

## Troubleshooting

### Common Issues and Solutions

#### Authentication Errors
```
Error: Failed to initialize Azure DevOps connection
```
**Solutions:**
- Verify your PAT is correct and not expired
- Check that your organization URL is correct (should be `https://dev.azure.com/YOUR_ORG`)
- Ensure your PAT has the required scopes

#### Project Not Found
```
Error: Project 'YOUR_PROJECT' not found
```
**Solutions:**
- Verify the project name is correct (case-sensitive)
- Ensure you have access to the project
- Try using the project ID instead of name

#### Permission Errors
```
Error: Access denied
```
**Solutions:**
- Verify your PAT has Test Management (Read & Write) permissions
- Check that your user account has the necessary permissions in the project

#### TypeScript Compilation Errors
```
Error: Cannot find module '@azure/identity'
```
**Solutions:**
- Run `npm install` to install all dependencies
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

### Debug Mode

To see more detailed logging, you can modify the client to enable verbose logging:

1. Open `src/AzureDevOpsTestPlansClient.ts`
2. Add more `console.log` statements in the methods you want to debug
3. Run the example again

### Testing with Your Data

To test with your actual Azure DevOps data:

1. **Replace the example values** in `example.ts`:
   - Change `'MyProject\\Sprint 1'` to your actual iteration path
   - Change `'MyProject\\Area1'` to your actual area path
   - Update test plan names to match your naming conventions

2. **Get actual IDs** from your Azure DevOps:
   - Run the example to see your existing test plans
   - Use real suite IDs and build IDs in the examples

## Available Scripts

- `npm install` - Install dependencies
- `npm run build` - Compile TypeScript to JavaScript
- `npm run example` - Run the example demo directly
- `npm run example:build` - Build then run the example
- `npm start` - Run the compiled main application
- `npm run dev` - Run in development mode
- `npm run clean` - Clean the dist folder

## Next Steps

After successfully running the example:

1. **Explore the API methods** in `src/AzureDevOpsTestPlansClient.ts`
2. **Create your own scripts** using the client
3. **Integrate into your CI/CD pipeline** for automated test management
4. **Extend the functionality** by adding more Azure DevOps API calls

## Need Help?

If you encounter issues:

1. Check the console output for detailed error messages
2. Verify your environment variables in `.env`
3. Ensure your PAT has the correct permissions
4. Review the Azure DevOps API documentation for additional context
