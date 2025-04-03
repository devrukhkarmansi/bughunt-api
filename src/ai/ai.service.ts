import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  // Fallback card content
  private readonly fallbackContent = {
    easy: [
      {
        bug: 'Null Pointer Exception',
        solution: 'Check for null before accessing object',
      },
      {
        bug: 'Array Index Out of Bounds',
        solution: 'Verify array index is within bounds',
      },
      {
        bug: 'Infinite Loop',
        solution: 'Add proper loop termination condition',
      },
    ],
    medium: [
      { bug: 'Race Condition', solution: 'Implement proper synchronization' },
      { bug: 'Memory Leak', solution: 'Release resources in finally block' },
      { bug: 'SQL Injection', solution: 'Use parameterized queries' },
    ],
    hard: [
      { bug: 'Deadlock', solution: 'Implement proper lock ordering' },
      {
        bug: 'Buffer Overflow',
        solution: 'Validate buffer size before writing',
      },
      { bug: 'Cross-Site Scripting', solution: 'Sanitize user input' },
    ],
  };

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generates bug-solution pairs for the game
   */
  async generateBugSolutionPairs(count: number): Promise<
    Array<{
      bug: string;
      solution: string;
      difficulty: 'easy' | 'medium' | 'hard';
    }>
  > {
    try {
      const prompt = `Generate ${count} pairs of programming bugs and their solutions. 
      Format each pair as a JSON object with 'bug' (the problem), 'solution' (how to fix it), and 'difficulty' (easy/medium/hard).
      Return as a JSON array. Example:
      [
        {
          "bug": "Null pointer exception when accessing object property",
          "solution": "Add null check before accessing the property",
          "difficulty": "easy"
        }
      ]`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a programming expert. Generate realistic bug-solution pairs.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0].message.content;
      const aiPairs = JSON.parse(response);

      // Validate AI response format
      if (!Array.isArray(aiPairs) || aiPairs.length !== count) {
        throw new Error('Invalid AI response format');
      }

      return aiPairs;
    } catch (error) {
      console.error('Error generating bug-solution pairs:', error);
      return this.getFallbackPairs(count);
    }
  }

  /**
   * Gets fallback pairs from existing content
   */
  private getFallbackPairs(count: number): Array<{
    bug: string;
    solution: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }> {
    const pairs: Array<{
      bug: string;
      solution: string;
      difficulty: 'easy' | 'medium' | 'hard';
    }> = [];

    // Add pairs from each difficulty level
    Object.entries(this.fallbackContent).forEach(([difficulty, content]) => {
      content.forEach((item) => {
        pairs.push({
          bug: item.bug,
          solution: item.solution,
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
        });
      });
    });

    // Shuffle and return requested number of pairs
    return this.shuffleArray(pairs).slice(0, count);
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
