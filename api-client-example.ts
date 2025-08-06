/**
 * Example client for consuming the Azure DevOps Test Plans API Server
 * This demonstrates how to use the server from another project
 */

// Base API URL - update this to match your server's URL
const API_BASE_URL = 'http://localhost:3001';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    count?: number;
}

interface TestPlan {
    id: number;
    name: string;
    state: string;
    iteration: string;
    areaPath?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    owner?: {
        displayName: string;
    };
}

interface CreateTestPlanRequest {
    name: string;
    iteration: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    areaPath?: string;
}

interface UpdateTestPlanRequest {
    name?: string;
    iteration: string; // Required for updates
    description?: string;
    startDate?: string;
    endDate?: string;
    areaPath?: string;
}

interface CreateTestCaseRequest {
    title: string;
    steps?: string;
    priority?: number;
    areaPath?: string;
    iterationPath?: string;
}

class AzureDevOpsApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    }

    // Health check
    async healthCheck(): Promise<any> {
        const response = await this.makeRequest('/health');
        return response;
    }

    // Test Plans API

    /**
     * Get all test plans
     */
    async getAllTestPlans(filterActivePlans: boolean = true, includePlanDetails: boolean = false): Promise<TestPlan[]> {
        const params = new URLSearchParams({
            filterActivePlans: filterActivePlans.toString(),
            includePlanDetails: includePlanDetails.toString(),
        });

        const response = await this.makeRequest<TestPlan[]>(`/api/testplans?${params}`);
        return response.data || [];
    }

    /**
     * Get test plan by ID
     */
    async getTestPlan(id: number): Promise<TestPlan | null> {
        try {
            const response = await this.makeRequest<TestPlan>(`/api/testplans/${id}`);
            return response.data || null;
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Create new test plan
     */
    async createTestPlan(testPlan: CreateTestPlanRequest): Promise<TestPlan> {
        const response = await this.makeRequest<TestPlan>('/api/testplans', {
            method: 'POST',
            body: JSON.stringify(testPlan),
        });
        return response.data!;
    }

    /**
     * Update test plan
     */
    async updateTestPlan(id: number, updates: UpdateTestPlanRequest): Promise<TestPlan> {
        const response = await this.makeRequest<TestPlan>(`/api/testplans/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return response.data!;
    }

    /**
     * Delete test plan
     */
    async deleteTestPlan(id: number): Promise<void> {
        await this.makeRequest(`/api/testplans/${id}`, {
            method: 'DELETE',
        });
    }

    /**
     * Create test case
     */
    async createTestCase(testCase: CreateTestCaseRequest): Promise<any> {
        const response = await this.makeRequest('/api/testcases', {
            method: 'POST',
            body: JSON.stringify(testCase),
        });
        return response.data!;
    }

    /**
     * Add test cases to suite
     */
    async addTestCasesToSuite(planId: number, suiteId: number, testCaseIds: string[] | string): Promise<any> {
        const response = await this.makeRequest(`/api/testplans/${planId}/suites/${suiteId}/testcases`, {
            method: 'POST',
            body: JSON.stringify({ testCaseIds }),
        });
        return response.data!;
    }

    /**
     * Get test cases from suite
     */
    async getTestCasesFromSuite(planId: number, suiteId: number): Promise<any[]> {
        const response = await this.makeRequest<any[]>(`/api/testplans/${planId}/suites/${suiteId}/testcases`);
        return response.data || [];
    }

    /**
     * Get test results for build
     */
    async getTestResultsForBuild(buildId: number): Promise<any> {
        const response = await this.makeRequest(`/api/builds/${buildId}/testresults`);
        return response.data;
    }
}

// Example usage
async function exampleUsage() {
    const client = new AzureDevOpsApiClient();

    try {
        console.log('=== Azure DevOps API Client Demo ===\n');

        // 1. Health check
        console.log('1. Checking server health...');
        const health = await client.healthCheck();
        console.log('Server status:', health.status);
        console.log('Client initialized:', health.clientInitialized);
        console.log();

        // 2. Get all test plans
        console.log('2. Fetching all test plans...');
        const testPlans = await client.getAllTestPlans();
        console.log(`Found ${testPlans.length} test plans`);
        testPlans.forEach((plan, index) => {
            console.log(`${index + 1}. ${plan.name} (ID: ${plan.id}) - State: ${plan.state}`);
        });
        console.log();

        // 3. Create a new test plan
        console.log('3. Creating a new test plan...');
        const newTestPlan = await client.createTestPlan({
            name: 'API Demo Test Plan',
            iteration: 'MyProject\\Sprint 1',
            description: 'Test plan created via REST API',
            areaPath: 'MyProject\\API Tests'
        });
        console.log(`Created test plan: ${newTestPlan.name} (ID: ${newTestPlan.id})`);
        console.log();

        // 4. Get the created test plan
        console.log('4. Fetching the created test plan...');
        const fetchedPlan = await client.getTestPlan(newTestPlan.id);
        if (fetchedPlan) {
            console.log(`Retrieved: ${fetchedPlan.name}`);
            console.log(`Description: ${fetchedPlan.description}`);
        }
        console.log();

        // 5. Update the test plan
        console.log('5. Updating the test plan...');
        const updatedPlan = await client.updateTestPlan(newTestPlan.id, {
            name: 'Updated API Demo Test Plan',
            iteration: 'MyProject\\Sprint 1',
            description: 'Updated via REST API'
        });
        console.log(`Updated test plan: ${updatedPlan.name}`);
        console.log();

        // 6. Create a test case
        console.log('6. Creating a test case...');
        const testCase = await client.createTestCase({
            title: 'API Test Case',
            steps: '1. Call API endpoint|API responds successfully\n2. Verify response|Response contains expected data',
            priority: 2,
            areaPath: 'MyProject\\API Tests'
        });
        console.log(`Created test case: ${testCase.fields['System.Title']} (ID: ${testCase.id})`);
        console.log();

        console.log('=== Demo completed successfully! ===');

    } catch (error) {
        console.error('Demo failed:', error);
    }
}

// Export for use in other projects
export { AzureDevOpsApiClient, CreateTestPlanRequest, UpdateTestPlanRequest, CreateTestCaseRequest, TestPlan };

// Run example if this file is executed directly
if (require.main === module) {
    exampleUsage();
}
