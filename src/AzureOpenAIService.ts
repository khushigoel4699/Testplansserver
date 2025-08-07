import OpenAI from 'openai';

export interface TestPlanRecommendation {
    name: string;
    description: string;
    objective: string;
    testCases: {
        title: string;
        description: string;
        steps: string[];
        expectedResult: string;
        priority: 'Critical' | 'High' | 'Medium' | 'Low';
        testType: 'Functional' | 'Integration' | 'Performance' | 'Security' | 'Usability' | 'Regression';
    }[];
    coverage: {
        functionalAreas: string[];
        riskAreas: string[];
        userScenarios: string[];
    };
}

export class AzureOpenAIService {
    private client: OpenAI;
    private deploymentName: string;
    
    constructor() {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
        
        if (!endpoint || !apiKey) {
            throw new Error('Azure OpenAI configuration missing. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY environment variables.');
        }
        
        this.client = new OpenAI({
            apiKey,
            baseURL: `${endpoint}/openai/deployments/${deploymentName}`,
            defaultQuery: { 'api-version': apiVersion },
            defaultHeaders: {
                'api-key': apiKey,
            }
        });
        this.deploymentName = deploymentName;
    }
    
    async generateTestPlanRecommendations(
        prd: string, 
        existingTestPlans: any[], 
        testPlanId: string
    ): Promise<TestPlanRecommendation[]> {
        try {
            const systemPrompt = this.buildSystemPrompt();
            const userPrompt = this.buildUserPrompt(prd, existingTestPlans, testPlanId);
            
            const response = await this.client.chat.completions.create({
                model: this.deploymentName, // For Azure OpenAI, this is the deployment name
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000,
                top_p: 0.9,
                frequency_penalty: 0,
                presence_penalty: 0
            });
            
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response content received from Azure OpenAI');
            }
            
            // Parse the JSON response
            const recommendations = this.parseRecommendations(content);
            return recommendations;
            
        } catch (error) {
            console.error('Error generating test plan recommendations:', error);
            throw new Error(`Failed to generate recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    
    private buildSystemPrompt(): string {
        return `You are an intelligent QA assistant tasked with analyzing two inputs:
A Product Requirements Document (PRD) – this contains detailed functional and non-functional requirements for a product or feature.
An Azure DevOps (ADO) test plan – this includes existing test cases, usually structured into test suites, test cases, steps, and acceptance criteria.
Your objective is to generate a list of recommended end-to-end (E2E) test scenarios that should be added to the test plan.
 
Your Goals
Identify E2E scenarios described in the PRD.
Compare these with test coverage in the ADO test plan.
Recommend E2E tests for any gaps—i.e., PRD scenarios not explicitly or implicitly covered in the ADO test plan.
Instructions
Extract and list all key user journeys, workflows, edge cases, or functional expectations from the PRD.
Parse the ADO test plan to understand what scenarios are already covered.
Compare the two inputs to detect missing tests.
Generate a structured list of recommended E2E test scenarios to ensure full PRD coverage.

📤 Output Format
Return your findings in the following JSON format:
 
{
  "recommended_e2e_tests": [
    {
      "title": "<Descriptive scenario title>",
      "prd_reference": "<Section or line in PRD that defines the requirement>",
      "reason": "<Why this test is required>",
      "missing_in_ado": true,
      "steps": [
        "<Step 1>",
        "<Step 2>"
      ]
    }
  ]
}`;
    }
    
    private buildUserPrompt(prd: string, existingTestPlans: any[], testPlanId: string): string {
        const existingPlansText = existingTestPlans.length > 0 
            ? `Here are the existing test plans and test cases for Test Plan ID ${testPlanId}:\n${JSON.stringify(existingTestPlans, null, 2)}\n\n`
            : 'No existing test plans provided.\n\n';
            
        return `${existingPlansText}Product Requirements Document (PRD):
${prd}

Please analyze the PRD and existing test plans to identify missing end-to-end test scenarios. Focus on critical user journeys and business workflows that are not covered by the existing tests.`;
    }
    
    private parseRecommendations(content: string): TestPlanRecommendation[] {
        try {
            // Clean the content - remove markdown code blocks if present
            const cleanContent = content
                .replace(/```json\s*\n?/g, '')
                .replace(/```\s*\n?/g, '')
                .trim();
            
            const parsed = JSON.parse(cleanContent);
            
            // Handle new format with recommended_e2e_tests
            let e2eTests: any[] = [];
            
            if (parsed.recommended_e2e_tests && Array.isArray(parsed.recommended_e2e_tests)) {
                e2eTests = parsed.recommended_e2e_tests;
            } else if (Array.isArray(parsed)) {
                // Fallback for old format
                return parsed as TestPlanRecommendation[];
            } else {
                throw new Error('Response must contain recommended_e2e_tests array or be an array of test plan recommendations');
            }
            
            // Convert new format to TestPlanRecommendation format
            const recommendations: TestPlanRecommendation[] = e2eTests.map((test, index) => {
                if (!test.title || !test.reason || !Array.isArray(test.steps)) {
                    throw new Error(`Invalid E2E test structure at index ${index}`);
                }
                
                return {
                    name: test.title,
                    description: test.reason,
                    objective: `Ensure ${test.title.toLowerCase()} works correctly as described in ${test.prd_reference || 'PRD'}`,
                    testCases: [{
                        title: test.title,
                        description: test.reason,
                        steps: test.steps,
                        expectedResult: "All steps complete successfully and the workflow functions as expected",
                        priority: 'High' as const,
                        testType: 'Functional' as const
                    }],
                    coverage: {
                        functionalAreas: [test.title.split(' ').slice(0, 2).join(' ')],
                        riskAreas: ["User workflow", "Business process"],
                        userScenarios: [test.title]
                    }
                };
            });
            
            return recommendations;
            
        } catch (error) {
            console.error('Error parsing recommendations:', error);
            console.error('Content received:', content);
            throw new Error(`Failed to parse recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
