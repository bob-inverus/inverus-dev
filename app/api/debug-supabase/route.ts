import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseEnabled } from "@/lib/supabase/config"

export async function GET() {
  try {
    const debug = {
      isSupabaseEnabled,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || 'NOT_SET',
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    }

    if (!isSupabaseEnabled) {
      return NextResponse.json({
        ...debug,
        error: "Supabase is not enabled - missing environment variables",
        canCreateClient: false,
      })
    }

    // Try to create a server client
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({
        ...debug,
        error: "Failed to create Supabase server client",
        canCreateClient: false,
      })
    }

    // Try to make a simple query
    const { data, error } = await supabase.from('users').select('count', { count: 'exact' }).limit(1)
    
    return NextResponse.json({
      ...debug,
      canCreateClient: true,
      canQuery: !error,
      queryError: error?.message || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
      isSupabaseEnabled,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE,
      timestamp: new Date().toISOString(),
    })
  }
} 