import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  Award,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { quizQuestions as defaultQuestions, calculateQuizResults } from '../../data/mockQuiz';
import { mockClubs } from '../../data/mockClubs';
import { fetchQuizQuestions, saveQuizResultRecord } from '../../services/quizService';
import { fetchClubs } from '../../services/clubService';
import { useAuth } from '../../context/AuthContext';

export default function QuizPage() {
  const { user, isAuthenticated, saveUserQuizResult, savedQuizResult } = useAuth();

  const [questionsList, setQuestionsList] = useState(defaultQuestions);
  const [clubsList, setClubsList] = useState(mockClubs);
  const [currentStep, setCurrentStep] = useState(0); // 0 to questions.length - 1
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    async function loadQuizData() {
      try {
        const [qRes, clubs] = await Promise.all([fetchQuizQuestions(), fetchClubs()]);
        if (qRes && qRes.data && qRes.data.length > 0) {
          setQuestionsList(qRes.data);
        }
        const clubData = clubs?.data || clubs || [];
        if (clubData.length > 0) {
          setClubsList(clubData);
        }
      } catch (err) {
        console.error('Failed to load dynamic quiz questions', err);
      }
    }
    loadQuizData();
  }, []);

  const currentQuestion = questionsList[currentStep] || questionsList[0] || defaultQuestions[0];
  const progressPercent = Math.round(((currentStep + 1) / questionsList.length) * 100);

  const handleSelectOption = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const handleNext = async () => {
    if (currentStep < questionsList.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate using active questions and clubs list
      const calculated = calculateQuizResults(answers, clubsList, questionsList);
      setResults(calculated);
      setIsCompleted(true);
      if (isAuthenticated) {
        if (typeof saveUserQuizResult === 'function') {
          saveUserQuizResult(calculated);
        } else {
          try {
            localStorage.setItem('cb_quiz_result', JSON.stringify(calculated));
          } catch (e) {
            console.warn('Could not store quiz result locally:', e);
          }
        }
        if (user?.id && calculated.topMatch?.id) {
          await saveQuizResultRecord(user.id, calculated.topMatch.id, calculated.allScores);
        }
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
    setResults(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Quiz Intro Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          WEIGHTED MATCHING SYSTEM
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          Which Club Should You Join?
        </h1>
        <p className="text-sm text-slate-400">
          Discover where your technical interests, problem-solving style, and career goals will flourish best.
        </p>
      </div>

      {!isCompleted ? (
        /* ===================== ACTIVE QUIZ QUESTIONS STEP ===================== */
        <div className="rounded-3xl border border-slate-800 bg-[#0a0e1a]/95 p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Progress Bar & Counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-cyan-400 font-semibold">
                Question {currentStep + 1} of {questionsList.length}
              </span>
              <span>{currentQuestion.category}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white leading-snug">
              {currentQuestion.question}
            </h2>
            <p className="text-xs text-slate-400">
              Choose the statement that resonates most authentically with you.
            </p>
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === idx;
              const optionLetters = ['A', 'B', 'C', 'D', 'E'];

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border text-left flex items-start gap-4 transition-all duration-200 group ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-glow-cyan'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                    }`}
                  >
                    {optionLetters[idx]}
                  </span>
                  <span className="text-sm sm:text-base font-normal leading-relaxed pt-0.5">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <Button
              variant="primary"
              size="md"
              disabled={answers[currentQuestion.id] === undefined}
              onClick={handleNext}
              icon={ArrowRight}
            >
              {currentStep === questionsList.length - 1 ? 'Calculate My Matches' : 'Next Question'}
            </Button>
          </div>
        </div>
      ) : (
        /* ===================== QUIZ RESULTS BREAKDOWN ===================== */
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0e1830] to-[#0a0e1c] p-6 sm:p-10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-500/30 font-semibold">
                  Match Breakdown
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-2">
                  Your Top Club Recommendations
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetake}
                  icon={RotateCcw}
                  iconPosition="left"
                >
                  Retake Quiz
                </Button>
              </div>
            </div>

            {/* Top Match Highlight Card (#1) */}
            {results && results.length > 0 && (
              <div className="relative rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/40 p-6 sm:p-8 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span>#1 HIGHEST AFFINITY MATCH</span>
                  </div>
                  <span className="text-2xl font-display font-extrabold text-cyan-400">
                    {results[0].percentage}% Match
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <img
                    src={results[0].club.logo}
                    alt={results[0].club.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-cyan-500/40 shadow-lg"
                  />
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white">
                      {results[0].club.name}
                    </h3>
                    <p className="text-xs text-cyan-300 font-mono">
                      {results[0].club.domain}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed pt-2">
                  {results[0].rationale}
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <Button
                    to={`/clubs/${results[0].clubId}`}
                    variant="cyan"
                    size="md"
                    icon={ArrowRight}
                  >
                    Explore {results[0].club.name} Hub
                  </Button>
                  <Button
                    to={`/events?club=${results[0].clubId}`}
                    variant="secondary"
                    size="md"
                  >
                    View Club Events
                  </Button>
                </div>
              </div>
            )}

            {/* Runner-Up Matches (#2, #3, etc.) */}
            <div className="space-y-4 pt-4">
              <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">
                Other Matching Clubs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results && results.slice(1).map((item, index) => (
                  <div
                    key={item.clubId}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.club.logo}
                          alt={item.club.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <h5 className="text-base font-semibold text-white">
                            {item.club.name}
                          </h5>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.club.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-bold text-slate-300">
                        {item.percentage}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {item.rationale}
                    </p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-mono">
                        Rank #{index + 2}
                      </span>
                      <Link
                        to={`/clubs/${item.clubId}`}
                        className="text-cyan-400 font-semibold hover:underline"
                      >
                        Explore Hub →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save results notice */}
            {!isAuthenticated ? (
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-300 text-center sm:text-left">
                  Sign in to permanently save your quiz match history to your student profile.
                </span>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold whitespace-nowrap"
                >
                  Log in to Save
                </Link>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-center text-xs text-emerald-300 font-mono">
                ✓ Results saved to your student profile ({user.email}).
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
