const fs = require('fs');
const https = require('https');

// Read the PRD content from file
const prdContent = fs.readFileSync('MPT-PRD.md', 'utf8');

// Prepare the request data
const requestData = JSON.stringify({
    prd: prdContent,
    testPlanId: "2541627"
});

// Request options
const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/testplans/recommendations',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
    }
};

console.log('🚀 Testing Recommendations API...');
console.log(`📄 PRD Length: ${prdContent.length} characters`);
console.log(`🎯 Target: http://localhost:3001/api/testplans/recommendations`);

// Make the request
const http = require('http'); // Use http instead of https for localhost
const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            console.log('\n✅ API Response Summary:');
            console.log(`Success: ${response.success}`);
            console.log(`PRD Length: ${response.data?.prdLength} characters`);
            console.log(`Existing Test Cases: ${response.data?.existingTestCasesCount}`);
            console.log(`Generated Recommendations: ${response.data?.recommendations?.length}`);
            
            if (response.data?.recommendations) {
                console.log('\n📋 Test Plan Recommendations:');
                response.data.recommendations.forEach((rec, index) => {
                    console.log(`  ${index + 1}. ${rec.name} - ${rec.testCases.length} test cases`);
                });
            }
            
            console.log('\n🎉 Test completed successfully!');
        } catch (error) {
            console.error('❌ Error parsing response:', error);
            console.error('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error);
});

// Write data to request body
req.write(requestData);
req.end();
