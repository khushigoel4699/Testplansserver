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
        return `You are an expert Test Manager and Quality Assurance professional with extensive experience in creating comprehensive test plans based on Product Requirements Documents (PRDs). Your task is to analyze PRDs and generate detailed, actionable test plan recommendations.

Key Responsibilities:
1. Analyze the provided PRD to understand the product functionality, user flows, and requirements
2. Review existing test plans to understand current coverage (but do NOT duplicate them)
3. Generate NEW, comprehensive test plans that complement existing testing
4. Focus on areas that may be missing or need additional coverage
5. Ensure test cases are specific, measurable, and actionable

Guidelines:
- Create test plans that are DIFFERENT from existing ones
- Focus on edge cases, integration scenarios, and user experience flows
- Prioritize test cases based on risk and business impact
- Include various test types: Functional, Integration, Performance, Security, Usability
- Provide clear, step-by-step test procedures
- Ensure comprehensive coverage of the PRD requirements

Response Format:
Return a valid JSON array of test plan recommendations. Each recommendation should follow this exact structure:

{
  "name": "Test Plan Name",
  "description": "Brief description of what this test plan covers",
  "objective": "Clear objective of the test plan",
  "testCases": [
    {
      "title": "Test case title",
      "description": "What this test case validates",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "expectedResult": "Expected outcome",
      "priority": "Critical|High|Medium|Low",
      "testType": "Functional|Integration|Performance|Security|Usability|Regression"
    }
  ],
  "coverage": {
    "functionalAreas": ["Area 1", "Area 2"],
    "riskAreas": ["Risk 1", "Risk 2"],
    "userScenarios": ["Scenario 1", "Scenario 2"]
  }
}`;
    }
    
    private buildUserPrompt(prd: string, existingTestPlans: any[], testPlanId: string): string {
        const existingPlansText = existingTestPlans.length > 0 
            ? `Here are the existing test plans and test cases for Test Plan ID ${testPlanId}:\n${JSON.stringify(existingTestPlans, null, 2)}\n\n`
            : 'No existing test plans provided.\n\n';
            
        return `${existingPlansText}Product Requirements Document (PRD):
${prd}

Please analyze the PRD and generate 2-3 comprehensive test plan recommendations that:
1. Cover different aspects of the product requirements
2. Are DISTINCT from any existing test plans
3. Focus on critical user journeys and business scenarios
4. Include proper test case prioritization
5. Cover various testing types (functional, integration, performance, etc.)

Generate test plans that would provide maximum value and coverage for this product. Return ONLY the JSON array without any additional text or markdown formatting.`;
    }
    
    private parseRecommendations(content: string): TestPlanRecommendation[] {
        try {
            // Clean the content - remove markdown code blocks if present
            const cleanContent = content
                .replace(/```json\s*\n?/g, '')
                .replace(/```\s*\n?/g, '')
                .trim();
            
            const parsed = JSON.parse(cleanContent);
            
            // Validate the structure
            if (!Array.isArray(parsed)) {
                throw new Error('Response must be an array of test plan recommendations');
            }
            
            // Validate each recommendation
            parsed.forEach((rec, index) => {
                if (!rec.name || !rec.description || !rec.objective || !Array.isArray(rec.testCases)) {
                    throw new Error(`Invalid recommendation structure at index ${index}`);
                }
                
                rec.testCases.forEach((testCase: any, tcIndex: number) => {
                    if (!testCase.title || !testCase.description || !Array.isArray(testCase.steps) || !testCase.expectedResult) {
                        throw new Error(`Invalid test case structure at recommendation ${index}, test case ${tcIndex}`);
                    }
                });
            });
            
            return parsed as TestPlanRecommendation[];
            
        } catch (error) {
            console.error('Error parsing recommendations:', error);
            console.error('Content received:', content);
            throw new Error(`Failed to parse recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
