import { z } from 'zod';
import { LangfuseAnalyticsClient } from '../langfuse-client.js';

export const getPromptDetailSchema = z.object({
  promptName: z.string().describe('The prompt name to retrieve'),
  version: z.number().optional().describe('Specific version to retrieve (if not provided, gets latest)'),
  label: z.string().optional().describe('Specific label to retrieve'),
});

export type GetPromptDetailArgs = z.infer<typeof getPromptDetailSchema>;

export async function getPromptDetail(
  client: LangfuseAnalyticsClient,
  args: GetPromptDetailArgs
) {
  try {
    const promptData = await client.getPrompt(args.promptName, args.version, args.label);

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(promptData, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error getting prompt detail: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}