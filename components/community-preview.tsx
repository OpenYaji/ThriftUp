"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"

interface Post {
  id: string
  title: string
  content: string
  likes_count: number
  replies_count: number
  users?: { username: string; avatar_url: string }
}

export default function CommunityPreview() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const supabase = getSupabaseBrowserClient()

        if (!supabase) {
          setIsConfigured(false)
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("community_posts")
          .select("*, users(username, avatar_url)")
          .order("created_at", { ascending: false })
          .limit(4)

        if (error) throw error
        setPosts(data || [])
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (!isConfigured) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Community Discussions</h2>
          <p className="text-muted-foreground mb-12">Join conversations with fellow thrift enthusiasts</p>
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              Supabase credentials are not configured. Please add your environment variables to fetch community posts.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Community Discussions</h2>
        <p className="text-muted-foreground mb-12">Join conversations with fellow thrift enthusiasts</p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-48 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="card p-6 hover:shadow-lg transition">
                <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.content}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {post.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {post.replies_count}
                    </span>
                  </div>
                  <button className="text-primary hover:underline text-sm font-semibold">Read More</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
