import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, messageId, type } = await request.json()

    if (!message || !type || !messageId) {
      return NextResponse.json(
        { error: "Message, messageId, and type are required" },
        { status: 400 }
      )
    }

    if (!["upvote", "downvote"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'upvote' or 'downvote'" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      )
    }
    
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Create feedback message based on type
    const feedbackMessage = `${type === "upvote" ? "👍" : "👎"} ${message} (Message ID: ${messageId})`

    // Insert feedback into the database
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        user_id: user.id,
        message: feedbackMessage,
      })
      .select()

    if (error) {
      console.error("Error inserting feedback:", error)
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error processing feedback:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
