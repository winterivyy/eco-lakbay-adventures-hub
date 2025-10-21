import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const allowedOrigins = [
  'https://www.eco-lakbay.com',
  'https://eco-lakbay.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

// Define the shape of a single question
interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number; // 0, 1, 2, or 3
}

// Main server logic
serve(async (req) => {
  const origin = req.headers.get('Origin') || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    const { action, ...body } = await req.json();

    if (action === 'generate') {
      // --- ACTION: GENERATE A NEW QUIZ ---
      const { topic } = body;
      if (!topic) throw new Error("Topic is required to generate a quiz.");

      const systemPrompt = `You are a helpful AI that generates quizzes. Create a 5-question multiple-choice quiz about the topic: "${topic}". Each question must have exactly 4 options. You MUST format your entire response as a single, valid JSON object. The JSON object should have a single key "questions" which is an array of 5 question objects. Each question object must have three keys: "questionText" (string), "options" (an array of 4 strings), and "correctAnswerIndex" (an integer from 0 to 3 representing the index of the correct option).`;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate the quiz on "${topic}".` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }, // Ask Gemini to respond in JSON
        }),
      });

      if (!geminiResponse.ok) throw new Error(`Gemini API error: ${await geminiResponse.text()}`);
      
      const geminiData = await geminiResponse.json();
      const quizData = JSON.parse(geminiData.candidates[0].content.parts[0].text);
      
      // Save the complete quiz (with answers) to the database
      const { data: savedQuiz, error: dbError } = await supabase
        .from('quizzes')
        .insert({ topic, questions: quizData.questions })
        .select('id, questions')
        .single();
      
      if (dbError) throw dbError;

      // Censor the correct answers before sending to the client
      const questionsForClient = savedQuiz.questions.map((q: QuizQuestion) => ({
        questionText: q.questionText,
        options: q.options,
      }));
      
      return new Response(JSON.stringify({ quizId: savedQuiz.id, questions: questionsForClient }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'grade') {
      // --- ACTION: GRADE A SUBMITTED QUIZ ---
      const { quizId, userAnswers } = body;
      if (!quizId || !userAnswers) throw new Error("quizId and userAnswers are required for grading.");

      // Retrieve the full quiz with correct answers from the database
      const { data: quiz, error: fetchError } = await supabase
        .from('quizzes')
        .select('questions')
        .eq('id', quizId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!quiz) throw new Error("Quiz not found.");

      let score = 0;
      const results = quiz.questions.map((question: QuizQuestion, index: number) => {
        const isCorrect = question.correctAnswerIndex === userAnswers[index];
        if (isCorrect) score++;
        return { isCorrect, correctAnswerIndex: question.correctAnswerIndex };
      });
      
      return new Response(JSON.stringify({ score, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      throw new Error("Invalid action provided.");
    }

  } catch (error) {
    console.error('Error in quiz function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});