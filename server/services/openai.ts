import OpenAI from "openai";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyzes an image using OpenAI's vision model to detect objects and suggest tags
 * @param base64Image - The base64-encoded image data
 * @returns An array of suggested tags
 */
export async function analyzeImage(base64Image: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a specialized AI for field technician work photos. Identify objects, equipment, environments, safety gear, and infrastructure elements in the image. Return 3-5 relevant, short tags (1-2 words each) that would be useful for categorizing this photo in a field technician database. Respond with JSON in this format: { 'tags': ['tag1', 'tag2', 'tag3'] }"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What are the most relevant tags for this field technician photo?"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"tags":[]}');
    return result.tags || [];
  } catch (error) {
    console.error("OpenAI image analysis error:", error);
    return [];
  }
}
