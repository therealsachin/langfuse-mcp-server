import { z } from 'zod';
import { LangfuseAnalyticsClient } from '../langfuse-client.js';

export const listPromptsSchema = z.object({
  limit: z.number().optional().describe('Maximum number of prompts to return (default: 50)'),
  page: z.number().optional().describe('Page number for pagination'),
  name: z.string().optional().describe('Filter by prompt name (substring match)'),
});

export type ListPromptsArgs = z.infer<typeof listPromptsSchema>;

export async function listPrompts(
  client: LangfuseAnalyticsClient,
  args: ListPromptsArgs = {}
) {
  try {
    const promptsData = await client.listPrompts(args);

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(promptsData, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error listing prompts: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}