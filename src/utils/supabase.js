import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export const submitScore = async (userData) => {
  const { username, xp, level, subjectsCount, topicsCompleted, streak } = userData

  const { data: existing, error: checkError } = await supabase
    .from('leaderboard')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (checkError) {
    throw checkError
  }

  if (existing) {
    const { data, error } = await supabase
      .from('leaderboard')
      .update({
        xp,
        level,
        subjects_count: subjectsCount,
        topics_completed: topicsCompleted,
        streak,
        updated_at: new Date().toISOString(),
      })
      .eq('username', username)
      .select()

    if (error) {
      throw error
    }

    return data
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .insert({
      username,
      xp,
      level,
      subjects_count: subjectsCount,
      topics_completed: topicsCompleted,
      streak,
    })
    .select()

  if (error) {
    throw error
  }

  return data
}

export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('xp', { ascending: false })
    .limit(20)

  if (error) {
    throw error
  }

  return data
}
