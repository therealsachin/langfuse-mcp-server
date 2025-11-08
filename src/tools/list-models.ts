import { z } from 'zod';
import { LangfuseAnalyticsClient } from '../langfuse-client.js';

export const listModelsSchema = z.object({
  limit: z.number().optional().describe('Maximum number of models to return (default: 50)'),
  page: z.number().optional().describe('Page number for pagination'),
});

export type ListModelsArgs = z.infer<typeof listModelsSchema>;

export async function listModels(
  client: LangfuseAnalyticsClient,
  args: ListModelsArgs = {}
) {
  try {
    const modelsData = await client.listModels(args);

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(modelsData, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error listing models: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}