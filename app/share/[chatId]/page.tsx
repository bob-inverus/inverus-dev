import { APP_DOMAIN } from "@/lib/config"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Article from "./article"

export const dynamic = "force-static"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chatId: string }>
}): Promise<Metadata> {
  if (!isSupabaseEnabled) {
    return notFound()
  }

  const { chatId } = await params
  const supabase = await createClient()

  if (!supabase) {
    return notFound()
  }

  const { data: chat } = await supabase
    .from("chats")
    .select("title, created_at, public")
    .eq("id", chatId)
    .single()

  const title = chat?.title || "Chat"
  const description = "A chat in inVerus"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${APP_DOMAIN}/share/${chatId}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function ShareChat({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  if (!isSupabaseEnabled) {
    return notFound()
  }

  const { chatId } = await params
  const supabase = await createClient()

  console.log("Share page - chatId:", chatId)
  console.log("Share page - supabase client:", !!supabase)

  if (!supabase) {
    console.log("Share page - no supabase client, redirecting")
    return notFound()
  }

  const { data: chatData, error: chatError } = await supabase
    .from("chats")
    .select("id, title, created_at, public")
    .eq("id", chatId)
    .single()

  console.log("Share page - chatData:", chatData)
  console.log("Share page - chatError:", chatError)

  if (chatError || !chatData) {
    console.log("Share page - chat error or no data, redirecting")
    redirect("/")
  }

  // Check if the chat is public
  console.log("Share page - chat public status:", chatData.public)
  if (!chatData.public) {
    console.log("Share page - chat not public, redirecting")
    redirect("/")
  }

  const { data: messagesData, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })

  console.log("Share page - messagesData count:", messagesData?.length)
  console.log("Share page - messagesError:", messagesError)

  if (messagesError || !messagesData) {
    console.log("Share page - messages error or no data, redirecting")
    redirect("/")
  }

  return (
    <Article
      messages={messagesData}
      date={chatData.created_at || ""}
      title={chatData.title || ""}
      subtitle={"A conversation in inVerus"}
    />
  )
}