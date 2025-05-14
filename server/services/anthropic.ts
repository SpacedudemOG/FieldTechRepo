import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { Tag, insertTagSchema } from '@shared/schema';

// The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Domain-specific context for field technician equipment and scenarios
const FIELD_EQUIPMENT_CONTEXT = `
Field technicians commonly encounter and photograph the following types of equipment, conditions, and scenarios:

Equipment:
- Electrical panels and switchgear
- HVAC systems (air handlers, chillers, condensers)
- Generators and backup power systems 
- Motors, pumps, and compressors
- Industrial control systems and PLCs
- Transformers and power distribution equipment
- Communication equipment (antennas, radios, terminals)
- Safety equipment (fire suppression, emergency lighting)
- Cooling towers and heat exchangers
- Piping systems and valves
- Sensors and monitoring devices

Conditions:
- Corrosion and rust
- Water damage and leaks
- Thermal anomalies (hot spots)
- Physical damage
- Loose connections
- Improper installation
- Oil/fluid leaks
- Dirt and debris accumulation
- Worn components
- Misalignment
- Arc flash damage

Scenarios:
- Preventive maintenance inspections
- Troubleshooting and diagnosis
- Installation verification
- Compliance checks
- Safety violations
- Before/after repair documentation
- Environmental conditions assessment
- Asset verification
- Training examples
- Warranty claim documentation
`;

/**
 * Analyzes an image and provides domain-specific tags for field technicians
 * @param base64Image - The base64-encoded image data
 * @returns An array of tag objects with name and confidence score
 */
export async function analyzeImageWithDomainKnowledge(base64Image: string): Promise<Tag[]> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      system: `You are an AI assistant specialized in analyzing field technician photographs. 
      Your task is to identify equipment, conditions, and maintenance scenarios in these images.
      ${FIELD_EQUIPMENT_CONTEXT}
      
      Provide your analysis as a JSON array of objects, each with 'name' and 'confidence' properties.
      - 'name' should be a concise tag (1-2 words) identifying what you see
      - 'confidence' should be a number between 0.1 and 1.0
      
      Focus on the most relevant and specific tags for field technicians (3-8 tags).
      Prioritize identifying equipment type, condition, and purpose of the photo.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this field technician photograph. Identify the equipment, condition, and likely purpose of this image. Return ONLY a JSON array of tags with confidence scores."
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
    });

    // Extract the content from the response
    const contentBlock = response.content[0];
    const textContent = typeof contentBlock === 'object' && 'text' in contentBlock
      ? contentBlock.text
      : '';
    
    // Find the JSON array within the text (Anthropic might include additional text)
    const jsonMatch = textContent.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      console.error("Failed to parse JSON from Anthropic response");
      return getDefaultTags();
    }
    
    try {
      const tags = JSON.parse(jsonMatch[0]);
      
      // Generate IDs and format to match our Tag schema
      return tags.map((tag: any, index: number) => ({
        id: index + 1,
        name: tag.name,
        confidence: tag.confidence || 0.8, // Default if missing
        aiGenerated: true
      }));
    } catch (parseError) {
      console.error("Error parsing JSON from Anthropic response:", parseError);
      return getDefaultTags();
    }
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    return getDefaultTags();
  }
}

/**
 * Provides tag suggestions for a given query related to field equipment
 * @param query - Query text about equipment or conditions to get related tags
 * @returns Promise<Tag[]> An array of suggested tags
 */
export async function suggestDomainSpecificTags(query: string): Promise<Tag[]> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      system: `You are an AI assistant that helps field technicians with tagging their equipment photos.
      ${FIELD_EQUIPMENT_CONTEXT}
      
      When asked about a specific piece of equipment or condition, suggest related tags that would be useful for categorizing photos.
      Return your response as a JSON array of objects, each with 'name' and 'relevance' properties.`,
      messages: [
        {
          role: "user",
          content: `Suggest relevant tags for field technician photos related to: "${query}". Return ONLY a JSON array.`
        }
      ],
    });

    // Extract the content from the response
    const contentBlock = response.content[0];
    const textContent = typeof contentBlock === 'object' && 'text' in contentBlock
      ? contentBlock.text
      : '';
    
    // Find the JSON array within the text
    const jsonMatch = textContent.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      console.error("Failed to parse JSON from Anthropic response");
      return [];
    }
    
    try {
      const tags = JSON.parse(jsonMatch[0]);
      
      // Generate IDs and format to match our Tag schema
      return tags.map((tag: any, index: number) => ({
        id: 100 + index, // Use higher IDs to avoid conflicts
        name: tag.name,
        confidence: tag.relevance || 0.9, // Use relevance as confidence
        aiGenerated: true
      }));
    } catch (parseError) {
      console.error("Error parsing JSON from Anthropic response:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    return [];
  }
}

/**
 * Provides default tags in case the API fails
 * @returns Array of basic field technician tags
 */
function getDefaultTags(): Tag[] {
  // Fallback tags with IDs
  return [
    { id: 1, name: 'equipment', confidence: 0.9, aiGenerated: true },
    { id: 2, name: 'maintenance', confidence: 0.8, aiGenerated: true },
    { id: 3, name: 'inspection', confidence: 0.7, aiGenerated: true }
  ];
}

/**
 * Processes all photos and suggests domain-specific tags based on field technician knowledge
 * @param photoFileName - File name of the photo to process
 * @returns Promise<Tag[]> Array of suggested tags
 */
export async function processFieldTechnicianPhoto(photoFileName: string): Promise<Tag[]> {
  try {
    // Read the file from uploads directory
    const filePath = `./uploads/${photoFileName}`;
    const imageBuffer = readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Analyze the image with domain-specific knowledge
    return await analyzeImageWithDomainKnowledge(base64Image);
  } catch (error) {
    console.error("Error processing field technician photo:", error);
    return getDefaultTags();
  }
}