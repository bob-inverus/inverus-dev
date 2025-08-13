"use client"

import { useEffect, useState } from "react"

const GUEST_QUERY_LIMIT = 5
const STORAGE_KEY = "guest-query-count"

export function useGuestQueries() {
  const [queryCount, setQueryCount] = useState(0)
  const [hasReachedLimit, setHasReachedLimit] = useState(false)

  useEffect(() => {
    // Load existing count from localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const count = parseInt(stored, 10)
      setQueryCount(count)
      setHasReachedLimit(count >= GUEST_QUERY_LIMIT)
    }
  }, [])

  const incrementQueryCount = () => {
    const newCount = queryCount + 1
    setQueryCount(newCount)
    localStorage.setItem(STORAGE_KEY, newCount.toString())
    
    if (newCount >= GUEST_QUERY_LIMIT) {
      setHasReachedLimit(true)
    }
    
    return newCount
  }

  const canMakeQuery = () => {
    return queryCount < GUEST_QUERY_LIMIT
  }

  const getRemainingQueries = () => {
    return Math.max(0, GUEST_QUERY_LIMIT - queryCount)
  }

  const resetQueryCount = () => {
    setQueryCount(0)
    setHasReachedLimit(false)
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    queryCount,
    hasReachedLimit,
    canMakeQuery,
    incrementQueryCount,
    getRemainingQueries,
    resetQueryCount,
    GUEST_QUERY_LIMIT,
  }
} 