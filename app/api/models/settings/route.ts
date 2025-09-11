import {
  getModelsForSettingsWithAccessFlags,
} from "@/lib/models"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const models = await getModelsForSettingsWithAccessFlags()
    
    return new Response(JSON.stringify({ models }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error fetching settings models:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch models" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
