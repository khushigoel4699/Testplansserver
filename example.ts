import { AzureDevOpsTestPlansClient } from './src/AzureDevOpsTestPlansClient';

async function main() {
    try {
        // Initialize the client
        const client = new AzureDevOpsTestPlansClient();
        await client.initialize();

        console.log('=== Azure DevOps Test Plans Client Demo ===\n');

        // Example 1: Get all test plans
        console.log('1. Fetching all test plans...');
        const testPlans = await client.getAllTestPlans(true, false);
        console.log(`Retrieved ${testPlans.length} test plans\n`);

        // Example 2: Create a new test plan
        console.log('2. Creating a new test plan...');
        const newTestPlan = await client.createTestPlan(
            'Demo Test Plan',
            'MyProject\\Sprint 1',  // iteration
            'This is a demo test plan created via API',  // description
            '2024-01-01',  // start date  
            '2024-03-31',  // end date
            'MyProject\\Area1'  // area path
        );
        console.log(`Created test plan with ID: ${newTestPlan.id}\n`);

        // Example 3: Get the created test plan details
        if (newTestPlan.id) {
            console.log('3. Fetching test plan details...');
            const testPlanDetails = await client.getTestPlan(newTestPlan.id);
            console.log('Test plan details retrieved\n');
        }

        // Example 4: Create a test case
        console.log('4. Creating a test case...');
        const testCase = await client.createTestCase(
            'Demo Test Case',
            '1. Open the application|Application should open\n2. Login with valid credentials|User should be logged in',
            1,  // priority
            'MyProject\\Area1',  // area path
            'MyProject\\Sprint 1'  // iteration path
        );
        console.log(`Created test case with ID: ${testCase.id}\n`);

        // Example 5: Add test case to suite (assuming suite ID 1 exists)
        if (newTestPlan.id && testCase.id) {
            console.log('5. Adding test case to suite...');
            try {
                await client.addTestCasesToSuite(newTestPlan.id, 1, [testCase.id.toString()]);
            } catch (error) {
                console.log('Note: Could not add test case to suite (suite might not exist)\n');
            }
        }

        // Example 6: Get test cases from a plan and suite
        if (newTestPlan.id) {
            console.log('6. Fetching test cases from suite...');
            try {
                const testCases = await client.getTestCaseList(newTestPlan.id, 1);
                console.log(`Retrieved ${testCases.length} test cases from suite\n`);
            } catch (error) {
                console.log('Note: Could not fetch test cases (suite might not exist)\n');
            }
        }

        // Example 7: Update test plan
        if (newTestPlan.id) {
            console.log('7. Updating test plan...');
            const updatedPlan = await client.updateTestPlan(newTestPlan.id, {
                name: 'Updated Demo Test Plan',
                description: 'This test plan has been updated via API',
                iteration: 'MyProject\\Sprint 1'  // iteration is required for updates
            });
            console.log('Test plan updated successfully\n');
        }

        // Example 8: Get test results for a build (assuming build ID exists)
        console.log('8. Attempting to fetch test results for build...');
        try {
            const testResults = await client.getTestResultsFromBuildId(123);  // Replace with actual build ID
            console.log('Test results retrieved\n');
        } catch (error) {
            console.log('Note: Could not fetch test results (build might not exist)\n');
        }

        console.log('=== Demo completed successfully! ===');

    } catch (error) {
        console.error('Demo failed:', error);
    }
}

// Run the demo
main().catch(console.error);
