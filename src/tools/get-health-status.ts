import { z } from 'zod';
import { LangfuseAnalyticsClient } from '../langfuse-client.js';

export const getHealthStatusSchema = z.object({
  // No parameters needed for health check
});

export type GetHealthStatusArgs = z.infer<typeof getHealthStatusSchema>;

export async function getHealthStatus(
  client: LangfuseAnalyticsClient,
  args: GetHealthStatusArgs
) {
  try {
    const healthData = await client.getHealthStatus();

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(healthData, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error getting health status: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}