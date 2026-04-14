'use server';
/**
 * @fileOverview A Genkit flow for recommending a field type based on a field name.
 *
 * - recommendFieldType - A function that handles the field type recommendation process.
 * - FieldTypeRecommendationInput - The input type for the recommendFieldType function.
 * - FieldTypeRecommendationOutput - The return type for the recommendFieldType function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FieldTypeRecommendationInputSchema = z.object({
  fieldName: z.string().describe('The name of the field for which to recommend a type.'),
});
export type FieldTypeRecommendationInput = z.infer<typeof FieldTypeRecommendationInputSchema>;

const FieldTypeRecommendationOutputSchema = z.object({
  recommendedType: z.enum(['text', 'number', 'date', 'email']).describe('The recommended field type for the given field name (text, number, date, or email).'),
});
export type FieldTypeRecommendationOutput = z.infer<typeof FieldTypeRecommendationOutputSchema>;

const fieldTypeRecommendationPrompt = ai.definePrompt({
  name: 'fieldTypeRecommendationPrompt',
  input: { schema: FieldTypeRecommendationInputSchema },
  output: { schema: FieldTypeRecommendationOutputSchema },
  prompt: `You are an AI assistant that recommends the most appropriate field type for a given field name.
The available field types are: 'text', 'number', 'date', 'email'.

Given the field name "{{{fieldName}}}", please recommend the most suitable field type from the allowed options.
Consider common data patterns associated with field names.
Provide your recommendation in the specified JSON format.`,
});

const fieldTypeRecommendationFlow = ai.defineFlow(
  {
    name: 'fieldTypeRecommendationFlow',
    inputSchema: FieldTypeRecommendationInputSchema,
    outputSchema: FieldTypeRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await fieldTypeRecommendationPrompt(input);
    if (!output) {
      throw new Error('Failed to get a field type recommendation from the AI model.');
    }
    return output;
  }
);

export async function recommendFieldType(input: FieldTypeRecommendationInput): Promise<FieldTypeRecommendationOutput> {
  return fieldTypeRecommendationFlow(input);
}
