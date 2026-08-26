import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http')
)

function createOfflineClient() {
  const response = {
    data: null,
    error: { message: 'Supabase is not configured', code: 'NOT_CONFIGURED' },
  }
  const promise = Promise.resolve(response)

  const chain = {
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    upsert: () => chain,
    delete: () => chain,
    eq: () => chain,
    neq: () => chain,
    order: () => chain,
    filter: () => chain,
    match: () => chain,
    limit: () => chain,
    range: () => chain,
    maybeSingle: () => promise,
    single: () => promise,
    then: (onFulfilled, onRejected) => promise.then(onFulfilled, onRejected),
    catch: (onRejected) => promise.catch(onRejected),
  }

  if (typeof window !== 'undefined' && !window.__madisonSupabaseWarned) {
    window.__madisonSupabaseWarned = true
    console.warn(
      'Supabase env vars are missing. The shop will run in offline mode (localStorage). Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server.'
    )
  }

  return {
    from: () => chain,
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: response.error }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        createSignedUrl: async () => ({ data: null, error: response.error }),
        remove: async () => ({ data: null, error: response.error }),
        list: async () => ({ data: [], error: response.error }),
      }),
    },
    channel: () => ({
      on() {
        return this
      },
      subscribe() {
        return this
      },
      unsubscribe() {
        return this
      },
    }),
    removeChannel: () => {},
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : createOfflineClient()

export const createServerClient = () => {
  if (!isSupabaseConfigured) {
    return createOfflineClient()
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}
