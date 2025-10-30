import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // CORS preflight request handling remains the same.
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set in the function's environment variables.");
    }

    // --- FIX #1: REMOVED budget and travelStyle from the inputs ---
    const { startingPoint, duration, interests, groupSize } = await req.json();

    // --- FIX #2: REWRITTEN systemPrompt for a new focus ---
    const systemPrompt = `You are an expert travel planner for EcoLakbay, specializing in creating logical, efficient travel itineraries for Pampanga, Philippines. Your primary tool for planning is to think like Google Maps: you must consider realistic travel times, geographic proximity, and logical routes between locations.

    **Your Instructions:**
    1.  **Route Logic is Key:** Plan each day's activities to minimize travel time. Group nearby attractions together. The flow of the day must be geographically sensible.
    2.  **Anchor to the Starting Point:** The entire itinerary MUST begin from, and logically flow around, the user's specified starting point.
    3.  **Use Real, Verifiable Locations:** Mention real destinations, eco-lodges, local restaurants, and sustainable activities that can be found on a map in Pampanga. Do not invent places.
    4.  **Promote Sustainability:** Weave in relevant eco-friendly tips (e.g., "Bring reusable water bottles," "Support local artisans").
    5.  **Format with Markdown:** Use headings (e.g., "# Day 1: Angeles City Exploration"), bold text, and bullet points for clarity.
    6.  **Be Engaging:** Write in a friendly, welcoming, and inspiring tone.`;

    // --- FIX #3: SIMPLIFIED userPrompt to match the new inputs ---
    const userPrompt = `
      Please create a sustainable travel itinerary for me in Pampanga, Philippines based on these details:
      
      - **My Starting Point/Accommodation:** ${startingPoint}
      - **Trip Duration:** ${duration}
      - **Group Size:** ${groupSize} person(s)
      - **My Interests:** ${interests.join(', ')}

      Please provide a clear, day-by-day plan that is geographically logical and easy to follow.`;

    // The fetch request to Gemini API remains structurally the same.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }, // Slightly reduced temperature for more predictable routes
        safetySettings: [
          // Safety settings remain the same
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      throw new Error("Gemini returned an empty or blocked response. This might be due to safety settings.");
    }

    const tripPlan = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ tripPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in trip planner function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
