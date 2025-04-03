import * as dotenv from 'dotenv';
import { AiService } from './ai/ai.service';

// Load environment variables
dotenv.config();

async function testAiService() {
  const aiService = new AiService();

  try {
    console.log('Testing AI Service...');
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('Generating 3 bug-solution pairs...');

    const pairs = await aiService.generateBugSolutionPairs(3);

    console.log('\nGenerated Pairs:');
    console.log(JSON.stringify(pairs, null, 2));

    console.log('\nNumber of pairs:', pairs.length);
    console.log('First pair difficulty:', pairs[0].difficulty);
  } catch (error: any) {
    console.error('\nDetailed Error Information:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    if (error.type === 'invalid_request_error') {
      console.error('\nThis might be because:');
      console.error('1. Your API key is invalid');
      console.error('2. You have no remaining credits');
      console.error('3. Your account needs verification');
    }
  }
}

testAiService();
