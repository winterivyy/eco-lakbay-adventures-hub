import React, { useEffect, useState } from "react";

type Question = {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Which energy source is renewable?",
    options: ["Coal", "Wind", "Natural Gas", "Oil"],
    answerIndex: 1,
  },
  {
    id: 2,
    question: "What helps reduce single-use plastic waste?",
    options: [
      "Using disposable cutlery",
      "Bringing reusable bags",
      "Buying more packaged products",
      "Leaving trash behind",
    ],
    answerIndex: 1,
  },
  {
    id: 3,
    question: "Which action helps conserve water?",
    options: [
      "Letting the tap run while brushing",
      "Fixing leaks promptly",
      "Watering lawns at noon",
      "Washing small loads every day",
    ],
    answerIndex: 1,
  },
];

const GREEN_POINTS_KEY = "eco_green_points";

export default function QuizSection() {
  const [answers, setAnswers] = useState<Record<number, number | null>>(() =>
    QUESTIONS.reduce((acc, q) => {
      acc[q.id] = null;
      return acc;
    }, {} as Record<number, number | null>)
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [greenPoints, setGreenPoints] = useState<number>(() => {
    const raw = localStorage.getItem(GREEN_POINTS_KEY);
    return raw ? Number(raw) || 0 : 0;
  });
  const [justAwarded, setJustAwarded] = useState<number>(0);

  useEffect(() => {
    // keep localStorage in sync
    localStorage.setItem(GREEN_POINTS_KEY, String(greenPoints));
  }, [greenPoints]);

  function selectOption(qid: number, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: optionIndex }));
  }

  function submitQuiz() {
    // require all answered for a valid submission
    const allAnswered = QUESTIONS.every((q) => answers[q.id] !== null);
    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const correct = QUESTIONS.reduce((acc, q) => {
      const a = answers[q.id];
      return acc + (a === q.answerIndex ? 1 : 0);
    }, 0);

    setScore(correct);
    setSubmitted(true);

    // Award an equivalent green point upon completion:
    // for simplicity: award 1 green point when the user completes the quiz (you can change to score-based)
    const award = 1;
    setGreenPoints((prev) => {
      const updated = prev + award;
      setJustAwarded(award);
      return updated;
    });
  }

  function resetQuiz() {
    setAnswers(
      QUESTIONS.reduce((acc, q) => {
        acc[q.id] = null;
        return acc;
      }, {} as Record<number, number | null>)
    );
    setSubmitted(false);
    setScore(null);
    setJustAwarded(0);
  }

  return (
    <section id="quiz" className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white dark:bg-card rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-2">Quick Eco Quiz</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Complete this short quiz to earn a green point for your profile.
        </p>

        {!submitted && (
          <div className="space-y-6">
            {QUESTIONS.map((q) => (
              <div key={q.id}>
                <p className="font-medium mb-2">{q.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, i) => {
                    const selected = answers[q.id] === i;
                    return (
                      <button
                        key={i}
                        onClick={() => selectOption(q.id, i)}
                        className={`text-left px-3 py-2 rounded border ${
                          selected
                            ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                            : "border-transparent hover:border-slate-200"
                        }`}
                        aria-pressed={selected}
                      >
                        <span className="mr-2 font-semibold">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <button
                onClick={submitQuiz}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit and Earn Green Point
              </button>
              <button onClick={resetQuiz} className="text-sm text-muted-foreground">
                Reset
              </button>
            </div>
          </div>
        )}

        {submitted && score !== null && (
          <div className="mt-4">
            <p className="text-lg font-semibold">
              You scored {score} / {QUESTIONS.length}
            </p>
            <p className="mt-2">
              You earned <strong>{justAwarded}</strong> green point for completing the quiz.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Total green points: {greenPoints}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={resetQuiz} className="px-3 py-2 border rounded">
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
