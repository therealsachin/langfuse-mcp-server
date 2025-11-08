import { z } from 'zod';
import { LangfuseAnalyticsClient } from '../langfuse-client.js';

export const getObservationDetailSchema = z.object({
  observationId: z.string().describe('The observation ID to retrieve detailed information for'),
});

export type GetObservationDetailArgs = z.infer<typeof getObservationDetailSchema>;

export async function getObservationDetail(
  client: LangfuseAnalyticsClient,
  args: GetObservationDetailArgs
) {
  try {
    const observationData = await client.getObservation(args.observationId);

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(observationData, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error getting observation detail: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}