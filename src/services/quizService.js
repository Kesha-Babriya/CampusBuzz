import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { quizQuestions as defaultQuestions, calculateQuizResults } from '../data/mockQuiz';

export async function fetchQuizQuestions() {
  if (!isSupabaseConfigured || !supabase) {
    return { data: defaultQuestions, isFallback: true };
  }

  try {
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select('*, quiz_options(*)')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error || !questions || questions.length === 0) {
      return { data: defaultQuestions, isFallback: true };
    }

    const mapped = questions.map(q => ({
      id: q.id,
      question: q.question_text,
      category: q.category,
      options: (q.quiz_options || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map(opt => ({
          text: opt.option_text,
          weights: opt.club_weights || {}
        }))
    }));

    return { data: mapped, isFallback: false };
  } catch {
    return { data: defaultQuestions, isFallback: true };
  }
}

export async function saveQuizResultRecord(userId, topClubId, scores) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('quiz_results')
      .insert([{
        user_id: userId,
        top_club_id: topClubId,
        scores: scores
      }]);

    return { success: !error, error };
  } catch (err) {
    return { success: false, error: err };
  }
}
