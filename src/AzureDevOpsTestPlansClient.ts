import { DefaultAzureCredential, ClientSecretCredential, InteractiveBrowserCredential } from '@azure/identity';
import { getPersonalAccessTokenHandler, WebApi } from 'azure-devops-node-api';
import { ITestApi } from 'azure-devops-node-api/TestApi';
import { ITestPlanApi } from 'azure-devops-node-api/TestPlanApi';
import { IWorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { ITestResultsApi } from 'azure-devops-node-api/TestResultsApi';
import { TestPlan, TestPlanCreateParams, TestPlanUpdateParams } from 'azure-devops-node-api/interfaces/TestPlanInterfaces';
import { JsonPatchOperation, Operation } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class AzureDevOpsTestPlansClient {
    private webApi: WebApi | null = null;
    private testApi: ITestApi | null = null;
    private testPlanApi: ITestPlanApi | null = null;
    private workItemApi: IWorkItemTrackingApi | null = null;
    private testResultsApi: ITestResultsApi | null = null;
    private orgUrl: string;
    private project: string;

    constructor() {
        this.orgUrl = process.env.AZURE_DEVOPS_ORG_URL || '';
        this.project = process.env.AZURE_DEVOPS_PROJECT || '';

        if (!this.orgUrl || !this.project) {
            throw new Error('AZURE_DEVOPS_ORG_URL and AZURE_DEVOPS_PROJECT must be set in environment variables');
        }
    }

    /**
     * Initialize the Azure DevOps connection using different authentication methods
     */
    async initialize(): Promise<void> {
        try {
            // Try Personal Access Token first (most common for Azure DevOps)
            if (process.env.AZURE_DEVOPS_PAT) {
                console.log('Authenticating with Personal Access Token...');
                await this.initializeWithPAT();
                return;
            }

            // Try Service Principal authentication
            if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
                console.log('Authenticating with Service Principal...');
                await this.initializeWithServicePrincipal();
                return;
            }

            // Fall back to Interactive Browser authentication
            console.log('Authenticating with Interactive Browser...');
            await this.initializeWithInteractiveBrowser();

        } catch (error) {
            console.error('Failed to initialize Azure DevOps connection:', error);
            throw error;
        }
    }

    /**
     * Initialize with Personal Access Token (PAT)
     */
    private async initializeWithPAT(): Promise<void> {
        const pat = process.env.AZURE_DEVOPS_PAT!;
        const authHandler = getPersonalAccessTokenHandler(pat);
        this.webApi = new WebApi(this.orgUrl, authHandler);
        this.testApi = await this.webApi.getTestApi();
        this.testPlanApi = await this.webApi.getTestPlanApi();
        this.workItemApi = await this.webApi.getWorkItemTrackingApi();
        this.testResultsApi = await this.webApi.getTestResultsApi();
    }

    /**
     * Initialize with Service Principal
     */
    private async initializeWithServicePrincipal(): Promise<void> {
        const credential = new ClientSecretCredential(
            process.env.AZURE_TENANT_ID!,
            process.env.AZURE_CLIENT_ID!,
            process.env.AZURE_CLIENT_SECRET!
        );

        // Get access token for Azure DevOps
        const tokenResponse = await credential.getToken('499b84ac-1321-427f-aa17-267ca6975798/.default');
        
        if (!tokenResponse) {
            throw new Error('Failed to acquire access token');
        }

        const authHandler = getPersonalAccessTokenHandler(tokenResponse.token);
        this.webApi = new WebApi(this.orgUrl, authHandler);
        this.testApi = await this.webApi.getTestApi();
        this.testPlanApi = await this.webApi.getTestPlanApi();
        this.workItemApi = await this.webApi.getWorkItemTrackingApi();
        this.testResultsApi = await this.webApi.getTestResultsApi();
    }

    /**
     * Initialize with Interactive Browser authentication
     */
    private async initializeWithInteractiveBrowser(): Promise<void> {
        const credential = new InteractiveBrowserCredential({
            clientId: process.env.AZURE_CLIENT_ID || '872cd9fa-d31f-45e0-9eab-6e460a02d1f1', // Default Azure CLI client ID
            redirectUri: 'http://localhost:8080'
        });

        // Get access token for Azure DevOps
        const tokenResponse = await credential.getToken('499b84ac-1321-427f-aa17-267ca6975798/.default');
        
        if (!tokenResponse) {
            throw new Error('Failed to acquire access token');
        }

        const authHandler = getPersonalAccessTokenHandler(tokenResponse.token);
        this.webApi = new WebApi(this.orgUrl, authHandler);
        this.testApi = await this.webApi.getTestApi();
        this.testPlanApi = await this.webApi.getTestPlanApi();
        this.workItemApi = await this.webApi.getWorkItemTrackingApi();
        this.testResultsApi = await this.webApi.getTestResultsApi();
    }

    /**
     * Get a specific test plan by ID
     */
    async getTestPlan(testPlanId: number): Promise<TestPlan | undefined> {
        if (!this.testPlanApi) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        try {
            console.log(`Fetching test plan with ID: ${testPlanId}`);
            const testPlan = await this.testPlanApi.getTestPlanById(this.project, testPlanId);
            
            if (testPlan) {
                console.log('Test Plan Details:');
                console.log(`- ID: ${testPlan.id}`);
                console.log(`- Name: ${testPlan.name}`);
                console.log(`- State: ${testPlan.state}`);
                console.log(`- Area Path: ${testPlan.areaPath}`);
                console.log(`- Iteration: ${testPlan.iteration}`);
                console.log(`- Owner: ${testPlan.owner?.displayName}`);
                console.log(`- Start Date: ${testPlan.startDate}`);
                console.log(`- End Date: ${testPlan.endDate}`);
            }

            return testPlan;
        } catch (error) {
            console.error('Error fetching test plan:', error);
            throw error;
        }
    }

    /**
     * Get all test plans in the project
     */
    async getAllTestPlans(filterActivePlans: boolean = true, includePlanDetails: boolean = false): Promise<TestPlan[]> {
        if (!this.testPlanApi) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        try {
            console.log('Fetching all test plans...');
            const owner = ""; // Making owner an empty string until we can figure out how to get owner id
            const testPlans = await this.testPlanApi.getTestPlans(this.project, owner, undefined, includePlanDetails, filterActivePlans);
            
            console.log(`Found ${testPlans.length} test plan(s):`);
            testPlans.forEach((plan: TestPlan, index: number) => {
                console.log(`${index + 1}. ${plan.name} (ID: ${plan.id}) - State: ${plan.state}`);
            });

            return testPlans;
        } catch (error) {
            console.error('Error fetching test plans:', error);
            throw error;
        }
    }

    /**
     * Create a new test plan
     */
    async createTestPlan(name: string, iteration: string, description?: string, startDate?: string, endDate?: string, areaPath?: string): Promise<TestPlan> {
        if (!this.testPlanApi) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        try {
            const testPlanData: TestPlanCreateParams = {
                name: name,
                iteration: iteration,
                description: description,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                areaPath: areaPath
            };

            console.log(`Creating test plan: ${name}`);
            const createdPlan = await this.testPlanApi.createTestPlan(testPlanData, this.project);
            
            console.log(`Test plan created successfully with ID: ${createdPlan.id}`);
            return createdPlan;
        } catch (error) {
            console.error('Error creating test plan:', error);
            throw error;
        }
    }

    /**
     * Update an existing test plan
     */
    async updateTestPlan(testPlanId: number, updates: TestPlanUpdateParams): Promise<TestPlan> {
        if (!this.testPlanApi) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        try {
            console.log(`Updating test plan with ID: ${testPlanId}`);
            const updatedPlan = await this.testPlanApi.updateTestPlan(updates, this.project, testPlanId);
            
            console.log('Test plan updated successfully');
            return updatedPlan;
        } catch (error) {
            console.error('Error updating test plan:', error);
            throw error;
        }
    }

    /**
     * Delete a test plan
     */
    async deleteTestPlan(testPlanId: number): Promise<void> {
        if (!this.testPlanApi) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        try {
            console.log(`Deleting test plan with ID: ${testPlanId}`);
            await this.testPlanApi.deleteTestPlan(this.project, testPlanId);
            
            console.log('Test plan deleted successfully');
        } catch (error) {
            console.error('Error deleting test plan:', error);
            throw error;
        }
    }

    /**
     * Add test cases to a test suite
     */
    async addTestCasesToSuite(planId: number, suiteId: number, testCaseIds: string[] | string): Promise<any> {
        if (!this.testApi) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        try {
            console.log(`Adding test cases to suite ${suiteId} in plan ${planId}`);
            const testCaseIdsString = Array.isArray(testCaseIds) ? testCaseIds.join(",") : testCaseIds;
            const addedTestCases = await this.testApi.addTestCasesToSuite(this.project, planId, suiteId, testCaseIdsString);
            
            console.log('Test cases added to suite successfully');
            return addedTestCases;
        } catch (error) {
            console.error('Error adding test cases to suite:', error);
            throw error;
        }
    }

    /**
     * Create a new test case work item
     */
    async createTestCase(title: string, steps?: string, priority?: number, areaPath?: string, iterationPath?: string): Promise<any> {
        if (!this.workItemApi) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        try {
            console.log(`Creating test case: ${title}`);
            
            let stepsXml: string | undefined;
            if (steps) {
                stepsXml = this.convertStepsToXml(steps);
            }

            // Create JSON patch document for work item
            const patchDocument: JsonPatchOperation[] = [];

            patchDocument.push({
                op: Operation.Add,
                path: "/fields/System.Title",
                value: title
            });

            if (stepsXml) {
                patchDocument.push({
                    op: Operation.Add,
                    path: "/fields/Microsoft.VSTS.TCM.Steps",
                    value: stepsXml
                });
            }

            if (priority) {
                patchDocument.push({
                    op: Operation.Add,
                    path: "/fields/Microsoft.VSTS.Common.Priority",
                    value: priority
                });
            }

            if (areaPath) {
                patchDocument.push({
                    op: Operation.Add,
                    path: "/fields/System.AreaPath",
                    value: areaPath
                });
            }

            if (iterationPath) {
                patchDocument.push({
                    op: Operation.Add,
                    path: "/fields/System.IterationPath",
                    value: iterationPath
                });
            }

            const workItem = await this.workItemApi.createWorkItem({}, patchDocument, this.project, "Test Case");
            
            console.log(`Test case created successfully with ID: ${workItem.id}`);
            return workItem;
        } catch (error) {
            console.error('Error creating test case:', error);
            throw error;
        }
    }

    /**
     * Get list of test cases for a given test plan and suite
     */
    async getTestCaseList(planId: number, suiteId: number): Promise<any> {
        if (!this.testPlanApi) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        try {
            console.log(`Fetching test cases for plan ${planId}, suite ${suiteId}`);
            const testCases = await this.testPlanApi.getTestCaseList(this.project, planId, suiteId);
            
            console.log(`Found ${testCases.length} test case(s)`);
            return testCases;
        } catch (error) {
            console.error('Error fetching test cases:', error);
            throw error;
        }
    }

    /**
     * Get test results for a given build ID
     */
    async getTestResultsFromBuildId(buildId: number): Promise<any> {
        if (!this.testResultsApi) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        try {
            console.log(`Fetching test results for build ${buildId}`);
            const testResults = await this.testResultsApi.getTestResultDetailsForBuild(this.project, buildId);
            
            console.log(`Test results fetched successfully`);
            return testResults;
        } catch (error) {
            console.error('Error fetching test results:', error);
            throw error;
        }
    }

    /**
     * Get detailed test case information by work item ID
     * This includes test steps, expected results, outcomes, and all work item fields
     */
    async getTestCaseDetails(testCaseId: number, includeHistory: boolean = false): Promise<any> {
        if (!this.workItemApi) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        try {
            console.log(`Fetching test case details for ID: ${testCaseId}`);
            
            // Define the fields we want to retrieve
            const fields = [
                'System.Id',
                'System.Title',
                'System.Description',
                'System.State',
                'System.Reason',
                'System.AssignedTo',
                'System.CreatedBy',
                'System.CreatedDate',
                'System.ChangedBy',
                'System.ChangedDate',
                'System.AreaPath',
                'System.IterationPath',
                'System.Tags',
                'Microsoft.VSTS.Common.Priority',
                'Microsoft.VSTS.Common.Severity',
                'Microsoft.VSTS.TCM.Steps',
                'Microsoft.VSTS.TCM.LocalDataSource',
                'Microsoft.VSTS.TCM.AutomatedTestName',
                'Microsoft.VSTS.TCM.AutomatedTestStorage',
                'Microsoft.VSTS.TCM.AutomatedTestId',
                'Microsoft.VSTS.TCM.AutomatedTestType',
                'Microsoft.VSTS.TCM.Parameters',
                'Microsoft.VSTS.Common.AcceptanceCriteria'
            ];

            // Get the work item with specified fields
            const workItem = await this.workItemApi.getWorkItem(testCaseId, fields, undefined, undefined, includeHistory ? 'all' : undefined);
            
            if (!workItem) {
                throw new Error(`Test case with ID ${testCaseId} not found`);
            }

            // Parse and format the test case details
            const testCaseDetails = {
                id: workItem.id,
                url: workItem.url,
                fields: {
                    title: workItem.fields?.['System.Title'],
                    description: workItem.fields?.['System.Description'],
                    state: workItem.fields?.['System.State'],
                    reason: workItem.fields?.['System.Reason'],
                    assignedTo: workItem.fields?.['System.AssignedTo']?.displayName || workItem.fields?.['System.AssignedTo'],
                    createdBy: workItem.fields?.['System.CreatedBy']?.displayName || workItem.fields?.['System.CreatedBy'],
                    createdDate: workItem.fields?.['System.CreatedDate'],
                    changedBy: workItem.fields?.['System.ChangedBy']?.displayName || workItem.fields?.['System.ChangedBy'],
                    changedDate: workItem.fields?.['System.ChangedDate'],
                    areaPath: workItem.fields?.['System.AreaPath'],
                    iterationPath: workItem.fields?.['System.IterationPath'],
                    tags: workItem.fields?.['System.Tags'],
                    priority: workItem.fields?.['Microsoft.VSTS.Common.Priority'],
                    severity: workItem.fields?.['Microsoft.VSTS.Common.Severity'],
                    acceptanceCriteria: workItem.fields?.['Microsoft.VSTS.Common.AcceptanceCriteria']
                },
                testCaseFields: {
                    steps: workItem.fields?.['Microsoft.VSTS.TCM.Steps'],
                    localDataSource: workItem.fields?.['Microsoft.VSTS.TCM.LocalDataSource'],
                    automatedTestName: workItem.fields?.['Microsoft.VSTS.TCM.AutomatedTestName'],
                    automatedTestStorage: workItem.fields?.['Microsoft.VSTS.TCM.AutomatedTestStorage'],
                    automatedTestId: workItem.fields?.['Microsoft.VSTS.TCM.AutomatedTestId'],
                    automatedTestType: workItem.fields?.['Microsoft.VSTS.TCM.AutomatedTestType'],
                    parameters: workItem.fields?.['Microsoft.VSTS.TCM.Parameters']
                },
                parsedSteps: this.parseTestStepsXml(workItem.fields?.['Microsoft.VSTS.TCM.Steps']),
                relations: workItem.relations,
                revision: workItem.rev
            };

            console.log('Test Case Details:');
            console.log(`- ID: ${testCaseDetails.id}`);
            console.log(`- Title: ${testCaseDetails.fields.title}`);
            console.log(`- State: ${testCaseDetails.fields.state}`);
            console.log(`- Priority: ${testCaseDetails.fields.priority}`);
            console.log(`- Assigned To: ${testCaseDetails.fields.assignedTo}`);
            console.log(`- Steps Count: ${testCaseDetails.parsedSteps?.length || 0}`);

            return testCaseDetails;
        } catch (error) {
            console.error('Error fetching test case details:', error);
            throw error;
        }
    }

    /**
     * Get multiple test case details by work item IDs
     */
    async getMultipleTestCaseDetails(testCaseIds: number[], includeHistory: boolean = false): Promise<any[]> {
        if (!this.workItemApi) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        try {
            console.log(`Fetching details for ${testCaseIds.length} test cases`);
            
            const promises = testCaseIds.map(id => this.getTestCaseDetails(id, includeHistory));
            const results = await Promise.allSettled(promises);
            
            const successfulResults = results
                .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
                .map(result => result.value);
            
            const failedResults = results
                .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
                .map((result, index) => ({
                    testCaseId: testCaseIds[index],
                    error: result.reason
                }));

            if (failedResults.length > 0) {
                console.warn(`Failed to fetch ${failedResults.length} test cases:`, failedResults);
            }

            console.log(`Successfully fetched ${successfulResults.length} test case details`);
            return successfulResults;
        } catch (error) {
            console.error('Error fetching multiple test case details:', error);
            throw error;
        }
    }

    /**
     * Helper function to convert steps text to XML format required for test cases
     */
    private convertStepsToXml(steps: string): string {
        // Accepts steps in the format: '1. Step one|Expected result one\n2. Step two|Expected result two'
        const stepsLines = steps.split('\n').filter(line => line.trim() !== '');

        let xmlSteps = `<steps id="0" last="${stepsLines.length}">`;

        for (let i = 0; i < stepsLines.length; i++) {
            const stepLine = stepsLines[i].trim();
            if (stepLine) {
                // Split step and expected result by '|', fallback to default if not provided
                const [stepPart, expectedPart] = stepLine.split('|').map(s => s.trim());
                const stepMatch = stepPart.match(/^(\d+)\.\s*(.+)$/);
                const stepText = stepMatch ? stepMatch[2] : stepPart;
                const expectedText = expectedPart || 'Verify step completes successfully';

                xmlSteps += `
                <step id="${i + 1}" type="ActionStep">
                    <parameterizedString isformatted="true">${this.escapeXml(stepText)}</parameterizedString>
                    <parameterizedString isformatted="true">${this.escapeXml(expectedText)}</parameterizedString>
                </step>`;
            }
        }

        xmlSteps += '</steps>';
        return xmlSteps;
    }

    /**
     * Helper function to parse test steps XML from Azure DevOps into a readable format
     */
    private parseTestStepsXml(stepsXml?: string): any[] {
        if (!stepsXml) {
            return [];
        }

        try {
            // This is a simple XML parser for test steps
            // In a production environment, you might want to use a proper XML parser
            const steps: any[] = [];
            const stepMatches = stepsXml.match(/<step[^>]*>(.*?)<\/step>/gs);
            
            if (stepMatches) {
                stepMatches.forEach((stepMatch, index) => {
                    const idMatch = stepMatch.match(/id="([^"]*)"/);
                    const typeMatch = stepMatch.match(/type="([^"]*)"/);
                    const paramMatches = stepMatch.match(/<parameterizedString[^>]*>(.*?)<\/parameterizedString>/gs);
                    
                    const step = {
                        id: idMatch ? idMatch[1] : (index + 1).toString(),
                        type: typeMatch ? typeMatch[1] : 'ActionStep',
                        action: '',
                        expectedResult: ''
                    };

                    if (paramMatches && paramMatches.length >= 1) {
                        step.action = this.cleanXmlContent(paramMatches[0]);
                    }
                    if (paramMatches && paramMatches.length >= 2) {
                        step.expectedResult = this.cleanXmlContent(paramMatches[1]);
                    }

                    steps.push(step);
                });
            }

            return steps;
        } catch (error) {
            console.warn('Failed to parse test steps XML:', error);
            return [];
        }
    }

    /**
     * Helper function to clean XML content and extract text
     */
    private cleanXmlContent(xmlContent: string): string {
        return xmlContent
            .replace(/<parameterizedString[^>]*>/g, '')
            .replace(/<\/parameterizedString>/g, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&apos;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/<[^>]*>/g, '') // Remove any remaining HTML/XML tags
            .trim();
    }

    /**
     * Helper function to escape XML special characters
     */
    private escapeXml(unsafe: string): string {
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '&':
                    return '&amp;';
                case "'":
                    return '&apos;';
                case '"':
                    return '&quot;';
                default:
                    return c;
            }
        });
    }
}
