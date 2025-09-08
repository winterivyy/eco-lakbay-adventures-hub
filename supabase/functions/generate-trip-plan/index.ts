import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// It's good practice to ensure the API key is available at the start.
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Interface for the incoming request from your frontend trip planner form
interface TripPlanRequest {
  duration: string;
  budget: string;
  interests: string[];
  travelStyle: string;
  groupSize: number;
}

serve(async (req) => {
  // Standard CORS preflight request handling
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for the API key at the beginning of the request processing.
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set in the environment variables.");
    }

    // Await the JSON body from the request and cast it to our interface.
    const { duration, budget, interests, travelStyle, groupSize }: TripPlanRequest = await req.json();

    // System instruction to define the AI's role and expertise.
    const systemPrompt = 'You are an expert eco-tourism travel planner specializing in sustainable travel in Pampanga, Philippines. Create detailed, practical trip plans that emphasize environmental responsibility, local community support, and authentic cultural experiences.';

    // Construct the user's prompt with the specific details from the form.
    const userPrompt = `Create a detailed eco-friendly trip plan for Pampanga, Philippines with the following preferences:
    
Duration: ${duration}
Budget: ${budget}
Interests: ${interests.join(', ')}
Travel Style: ${travelStyle}
Group Size: ${groupSize} people

Please include the following sections in your plan:
1.  **Day-by-Day Itinerary**: Specific eco-friendly destinations and activities in Pampanga.
2.  **Sustainable Accommodation**: Recommendations for eco-conscious places to stay.
3.  **Local Eco-Activities**: Unique, environmentally friendly attractions.
4.  **Green Transportation**: Suggestions for transport that minimize carbon footprint.
5.  **Sustainable Dining**: Local restaurants and food experiences that are sustainable.
6.  **Estimated Budget**: A breakdown of potential costs.
7.  **Responsible Tourism Tips**: Advice on supporting local communities and responsible travel.
8.  **Carbon Footprint Notes**: Considerations on how to minimize environmental impact.

Your response should focus on authentic Pampanga experiences that benefit local communities and preserve the environment.`;

    // Make the API call to the Gemini model.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // The 'contents' array should contain the user's message.
          contents: [{
            role: 'user',
            parts: [{ text: userPrompt }]
          }],
          // The system instruction provides context to the model.
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          // Configuration for the generation process.
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048 // Increased token limit for detailed plans
          },
          // Safety settings to prevent harmful content.
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error:', errorBody);
      throw new Error(`Gemini API request failed with status: ${response.status} and message: ${errorBody}`);
    }

    const data = await response.json();

    // Safely access the generated content from the response.
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      const safetyFeedback = data.promptFeedback ? JSON.stringify(data.promptFeedback) : "No specific reason provided.";
      throw new Error(`Gemini returned an empty or blocked response. This might be due to safety settings. Feedback: ${safetyFeedback}`);
    }
    const tripPlan = data.candidates[0].content.parts[0].text;

    // Send the generated trip plan back to the frontend.
    return new Response(JSON.stringify({ tripPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('An error occurred in the trip plan generation function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
