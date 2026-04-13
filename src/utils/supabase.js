import { createClient } from '@supabase/supabase-js'

let supabaseClient = null

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
  }

  supabaseClient = createClient(url, anonKey)
  return supabaseClient
}

export const submitScore = async (userData) => {
  const supabase = getSupabaseClient()
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
  const supabase = getSupabaseClient()
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
