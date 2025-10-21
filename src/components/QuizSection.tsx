import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client"; // Ensure you have this configured
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
  // State for managing the conversation
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Welcome to the Eco Quiz! What topic would you like to be quizzed on today?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State for managing quiz logic
  const [stage, setStage] = useState<QuizStage>('topic');
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const { toast } = useToast();

  // State for Green Points (from your original code)
  const [greenPoints, setGreenPoints] = useState<number>(() => {
    const raw = localStorage.getItem(GREEN_POINTS_KEY);
    return raw ? Number(raw) || 0 : 0;
  });
  const [justAwarded, setJustAwarded] = useState<number>(0);

  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep localStorage in sync for green points
    localStorage.setItem(GREEN_POINTS_KEY, String(greenPoints));
  }, [greenPoints]);

  useEffect(() => {
    // Auto-scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call the Supabase function for AI-powered quiz logic
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

      // Update quiz state from backend response
      if (data.newStage) {
        setStage(data.newStage);
      }
      if (typeof data.newScore === 'number') {
        setScore(data.newScore);
      }
      if (typeof data.newQuestionCount === 'number') {
        setQuestionCount(data.newQuestionCount);
      }
      
      // If quiz is completed, award points
      if (data.newStage === 'completed') {
        awardGreenPoints();
      }

    } catch (error) {
      console.error('Quiz error:', error);
      toast({
        title: "Error",
        description: "Could not connect to the AI Quizmaster. Please try again.",
        variant: "destructive",
      });
      // Add back user message to input if send fails
      setInputMessage(userMessage.content);
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
  
  const awardGreenPoints = () => {
      const pointsToAward = 1; // Or make it score-based: `score`
      setGreenPoints(prev => prev + pointsToAward);
      setJustAwarded(pointsToAward);
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

        {/* Chat Area */}
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
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input and Results Area */}
        {stage !== 'completed' ? (
          <div className="flex space-x-2">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                stage === 'topic' 
                ? "e.g., 'Recycling' or 'Marine Biology'" 
                : "Type your answer here..."
              }
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
            <p className="text-lg mt-2">
              Final Score: {score} / {questionCount}
            </p>
            <p className="mt-2 text-green-600 font-semibold">
              You earned <strong>{justAwarded}</strong> green point!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your total green points: {greenPoints}
            </p>
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
