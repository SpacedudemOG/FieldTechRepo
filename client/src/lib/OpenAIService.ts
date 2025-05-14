/**
 * OpenAI service for client-side operations
 * Note: Heavy operations like image analysis are done server-side
 * This is mostly for data formatting and display
 */

export interface AiTag {
  name: string;
  confidence?: number;
}

/**
 * Formats a tag to indicate if it was AI-generated
 */
export const formatAiTag = (tag: string, isAiGenerated: boolean): string => {
  if (isAiGenerated) {
    return `✨ ${tag}`;
  }
  return tag;
};

/**
 * Mock function to get tag suggestions for demo purposes when no API key is available
 * In production, we'd use the OpenAI API
 */
export const getTagSuggestions = (photoTitle: string): AiTag[] => {
  const commonTags: AiTag[] = [
    { name: 'construction', confidence: 0.95 },
    { name: 'safety gear', confidence: 0.88 },
    { name: 'equipment', confidence: 0.92 },
    { name: 'inspection', confidence: 0.85 },
    { name: 'utility', confidence: 0.90 },
    { name: 'maintenance', confidence: 0.89 },
    { name: 'infrastructure', confidence: 0.87 },
    { name: 'power lines', confidence: 0.82 },
    { name: 'worksite', confidence: 0.93 },
    { name: 'repair', confidence: 0.84 },
  ];
  
  // Select 3-5 random tags
  const count = Math.floor(Math.random() * 3) + 3; // 3-5 tags
  const shuffled = [...commonTags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
