# Azure DevOps Test Plans Client

A comprehensive TypeScript client for managing Azure DevOps Test Plans, Test Cases, and Test Results using the Azure DevOps REST API.

## Features

This client provides the following functionality based on the Azure DevOps Test Plans API:

### Test Plan Management
- **List Test Plans**: Get all test plans in a project with filtering options
- **Create Test Plan**: Create new test plans with detailed configuration
- **Get Test Plan**: Retrieve specific test plan details by ID
- **Update Test Plan**: Modify existing test plans
- **Delete Test Plan**: Remove test plans from the project

### Test Case Management  
- **Create Test Case**: Create new test case work items with steps and metadata
- **Add Test Cases to Suite**: Associate existing test cases with test suites
- **List Test Cases**: Get test cases from specific test plans and suites

### Test Results
- **Get Test Results**: Retrieve test results for specific builds

### Authentication Support
- **Personal Access Token (PAT)**: Primary authentication method
- **Service Principal**: For automated scenarios
- **Interactive Browser**: Fallback for development

## Setup

### Prerequisites
- Node.js (v14 or higher)
- TypeScript
- An Azure DevOps organization and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the project root:

```env
# Required
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-organization
AZURE_DEVOPS_PROJECT=your-project-name

# Authentication - Choose one method:

# Method 1: Personal Access Token (Recommended)
AZURE_DEVOPS_PAT=your-personal-access-token

# Method 2: Service Principal
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret  
AZURE_TENANT_ID=your-tenant-id

# Method 3: Interactive Browser (fallback)
# No additional env vars needed
```

### Personal Access Token Setup

1. Go to Azure DevOps → User Settings → Personal Access Tokens
2. Create a new token with the following scopes:
   - **Test management**: Read & Write
   - **Work items**: Read & Write
   - **Build**: Read (for test results)

## Usage

### Basic Usage

```typescript
import { AzureDevOpsTestPlansClient } from './src/AzureDevOpsTestPlansClient';

async function example() {
    // Initialize the client
    const client = new AzureDevOpsTestPlansClient();  
    await client.initialize();

    // Get all test plans
    const testPlans = await client.getAllTestPlans();
    console.log(`Found ${testPlans.length} test plans`);
}
```

### Advanced Examples

#### Create a Test Plan

```typescript
const testPlan = await client.createTestPlan(
    'My Test Plan',              // name
    'MyProject\\Sprint 1',       // iteration (required)
    'Test plan description',     // description (optional)
    '2024-01-01',               // start date (optional)
    '2024-03-31',               // end date (optional)  
    'MyProject\\Area1'          // area path (optional)
);
```

#### Create a Test Case with Steps

```typescript
const testCase = await client.createTestCase(
    'Login Test Case',
    '1. Navigate to login page|Login page should be displayed\n2. Enter valid credentials|User should be logged in',
    1,                          // priority
    'MyProject\\Web',           // area path
    'MyProject\\Sprint 1'       // iteration path
);
```

#### Add Test Cases to a Suite

```typescript
await client.addTestCasesToSuite(
    123,                        // plan ID
    456,                        // suite ID  
    ['789', '790']             // test case IDs
);
```

#### Get Test Results for a Build

```typescript
const testResults = await client.getTestResultsFromBuildId(buildId);
```

## API Reference

### Class: AzureDevOpsTestPlansClient

#### Methods

##### `initialize(): Promise<void>`
Initializes the client with Azure DevOps authentication.

##### `getAllTestPlans(filterActivePlans?: boolean, includePlanDetails?: boolean): Promise<TestPlan[]>`
- `filterActivePlans`: Filter to include only active test plans (default: true)
- `includePlanDetails`: Include detailed information about each test plan (default: false)

##### `getTestPlan(testPlanId: number): Promise<TestPlan | undefined>`
Get details of a specific test plan.

##### `createTestPlan(name: string, iteration: string, description?: string, startDate?: string, endDate?: string, areaPath?: string): Promise<TestPlan>`
Create a new test plan with the specified parameters.

##### `updateTestPlan(testPlanId: number, updates: TestPlanUpdateParams): Promise<TestPlan>`
Update an existing test plan.

##### `deleteTestPlan(testPlanId: number): Promise<void>`
Delete a test plan.

##### `createTestCase(title: string, steps?: string, priority?: number, areaPath?: string, iterationPath?: string): Promise<any>`
Create a new test case work item.

**Steps Format**: Use the format `'1. Step description|Expected result\n2. Next step|Next expected result'`

##### `addTestCasesToSuite(planId: number, suiteId: number, testCaseIds: string[] | string): Promise<any>`
Add existing test cases to a test suite.

##### `getTestCaseList(planId: number, suiteId: number): Promise<any>`
Get list of test cases for a specific test plan and suite.

##### `getTestResultsFromBuildId(buildId: number): Promise<any>`
Get test results for a specific build.

## Error Handling

The client includes comprehensive error handling:

```typescript
try {
    const testPlans = await client.getAllTestPlans();
} catch (error) {
    console.error('Failed to fetch test plans:', error);
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AZURE_DEVOPS_ORG_URL` | Yes | Your Azure DevOps organization URL |
| `AZURE_DEVOPS_PROJECT` | Yes | Project name or ID |
| `AZURE_DEVOPS_PAT` | Optional* | Personal Access Token |
| `AZURE_CLIENT_ID` | Optional* | Service Principal Client ID |
| `AZURE_CLIENT_SECRET` | Optional* | Service Principal Secret |
| `AZURE_TENANT_ID` | Optional* | Azure Tenant ID |

\* At least one authentication method must be configured

## Running the Example

```bash
# Compile TypeScript
npm run build

# Run the example
node dist/example.js
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Verify your PAT has the correct scopes
2. **Project Not Found**: Check the project name and organization URL
3. **Insufficient Permissions**: Ensure your account has test management permissions
4. **API Limits**: Azure DevOps has rate limits; implement retry logic for production use

### Debug Mode

Enable detailed logging by adding console.log statements or use the built-in logging in each method.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
