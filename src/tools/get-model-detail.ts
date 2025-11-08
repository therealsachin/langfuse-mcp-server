import { z } from 'zod';
import { LangfuseAnalyticsClient } from '../langfuse-client.js';

export const getModelDetailSchema = z.object({
  modelId: z.string().describe('The model ID to retrieve detailed information for'),
});

export type GetModelDetailArgs = z.infer<typeof getModelDetailSchema>;

export async function getModelDetail(
  client: LangfuseAnalyticsClient,
  args: GetModelDetailArgs
) {
  try {
    const modelData = await client.getModel(args.modelId);

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(modelData, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error getting model detail: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}