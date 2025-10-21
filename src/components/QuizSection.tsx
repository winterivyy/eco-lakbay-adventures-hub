// Your React Component file: e.g., src/components/QuizSection.tsx

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client"; // Your configured Supabase client
import { useToast } from "@/hooks/use-toast"; // Or your preferred notification system
import { Send } from "lucide-react";

// The message structure for our conversational quiz
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Defines the stages of the quiz
type QuizStage = 'topic' | 'ongoing' | 'completed';

const GREEN_POINTS_KEY = "eco_green_points";

export default function QuizSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Welcome to the Eco Quiz! What topic would you like to be quizzed on today?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<QuizStage>('topic');
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Green Points state from your original component
  const [greenPoints, setGreenPoints] = useState<number>(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(GREEN_POINTS_KEY) : null;
    return raw ? Number(raw) || 0 : 0;
  });
  const [justAwarded, setJustAwarded] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GREEN_POINTS_KEY, String(greenPoints));
    }
  }, [greenPoints]);

  // --- MODIFIED ---: Added `isLoading` to the dependency array
  // This makes the chat scroll down when the loading indicator appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-quiz-handler', {
        body: {
          message: inputMessage,
          history: messages.slice(-5), // Send recent context
          stage: stage,
          score: score,
          questionCount: questionCount,
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);

      if (data.newStage) setStage(data.newStage);
      if (typeof data.newScore === 'number') setScore(data.newScore);
      if (typeof data.newQuestionCount === 'number') setQuestionCount(data.newQuestionCount);
      
      if (data.newStage === 'completed') {
        const pointsToAward = 1;
        setGreenPoints(prev => prev + pointsToAward);
        setJustAwarded(pointsToAward);
      }

    } catch (error) {
      console.error('Quiz error:', error);
      toast({
        title: "Error",
        description: "Could not connect to the AI Quizmaster. Please try again.",
        variant: "destructive",
      });
      // Restore user input on error
      setInputMessage(userMessage.content);
      // Remove the user's optimistic message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  function resetQuiz() {
    setMessages([
      { role: 'assistant', content: "Let's try another topic! What would you like to be quizzed on?" }
    ]);
    setInputMessage('');
    setStage('topic');
    setScore(0);
    setQuestionCount(0);
    setJustAwarded(0);
    setIsLoading(false);
  }

  // --- JSX Rendering ---
  return (
    <section id="quiz" className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white dark:bg-card rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-semibold mb-2">AI Eco Quiz</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Test your knowledge on any eco-topic and earn green points!
                </p>
            </div>
            {stage === 'ongoing' && (
                <div className="text-lg font-bold text-green-600">
                    Score: {score}/{questionCount}
                </div>
            )}
        </div>

        <div className="h-80 bg-slate-50 dark:bg-slate-800 rounded-md p-4 overflow-y-auto flex flex-col space-y-4 mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {/* --- FIXED ---: Replaced the invalid comment with a real loading animation component */}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="max-w-md p-3 rounded-lg bg-muted text-foreground">
                <div className="flex items-center justify-center space-x-1">
                  <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {stage !== 'completed' ? (
          <div className="flex space-x-2">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={stage === 'topic' ? "e.g., 'Recycling'" : "Type your answer here..."}
              className="flex-1 px-3 py-2 border rounded-md dark:bg-input"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-semibold">Quiz Completed!</h3>
            <p className="text-lg mt-2">Final Score: {score} / {questionCount}</p>
            <p className="mt-2 text-green-600 font-semibold">You earned <strong>{justAwarded}</strong> green point!</p>
            <p className="mt-1 text-sm text-muted-foreground">Your total green points: {greenPoints}</p>

            <button
              onClick={resetQuiz}
              className="mt-4 px-4 py-2 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Take Another Quiz
            </button>
          </div>
        )}
      </div>
    </section>
  );
}