import { FREE_MODELS_IDS } from "../config"
import { claudeModels } from "./data/claude"
import { customModels } from "./data/custom"
import { deepseekModels } from "./data/deepseek"
import { geminiModels } from "./data/gemini"
import { grokModels } from "./data/grok"
import { mistralModels } from "./data/mistral"
import {perplexityModels } from "./data/perplexity"
import { getOllamaModels, ollamaModels } from "./data/ollama"
import { openrouterModels } from "./data/openrouter"
import { ModelConfig } from "./types"

// Static models (always available)
const STATIC_MODELS: ModelConfig[] = [
  ...customModels,
  ...mistralModels,
]

// Dynamic models cache
let dynamicModelsCache: ModelConfig[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// // Function to get all models including dynamically detected ones
export async function getAllModels(): Promise<ModelConfig[]> {
  const now = Date.now()

  // Use cache if it's still valid
  if (dynamicModelsCache && now - lastFetchTime < CACHE_DURATION) {
    return dynamicModelsCache
  }

  try {
    // Include custom models and Mistral Large (needed for chat functionality)
    dynamicModelsCache = STATIC_MODELS.filter((m) => 
      m.id === "mistral-large-latest" || m.id === "harvestor" || m.id === "consortium"
    )

    lastFetchTime = now
    return dynamicModelsCache
  } catch (error) {
    console.warn("Failed to load dynamic models, using static models:", error)
    return STATIC_MODELS.filter((m) => 
      m.id === "mistral-large-latest" || m.id === "harvestor" || m.id === "consortium"
    )
  }
}

export async function getModelsWithAccessFlags(): Promise<ModelConfig[]> {
  const models = await getAllModels()

  // All models accessible
  return models.map((model) => ({ ...model, accessible: true }))
}

// Function to get models for settings UI (excludes Mistral models)
export async function getModelsForSettings(): Promise<ModelConfig[]> {
  const allModels = await getAllModels()
  return allModels.filter((m) => 
    m.id === "harvestor" || m.id === "consortium"
  )
}

export async function getModelsForSettingsWithAccessFlags(): Promise<ModelConfig[]> {
  const models = await getModelsForSettings()
  return models.map((model) => ({
    ...model,
    accessible: true,
  }))
}

export async function getModelsForProvider(
  provider: string
): Promise<ModelConfig[]> {
  const models = STATIC_MODELS

  const providerModels = models
    .filter((model) => model.providerId === provider && model.id === "mistral-large-latest")
    .map((model) => ({
      ...model,
      accessible: true,
    }))

  return providerModels
}

// Function to get models based on user's available providers
export async function getModelsForUserProviders(
  providers: string[]
): Promise<ModelConfig[]> {
  // Only provide Mistral Large regardless of providers
  return STATIC_MODELS.filter((m) => m.id === "mistral-large-latest")
}

// Synchronous function to get model info for simple lookups
// This uses cached data if available, otherwise falls back to static models
export function getModelInfo(modelId: string): ModelConfig | undefined {
  // First check the cache if it exists
  if (dynamicModelsCache) {
    const cachedModel = dynamicModelsCache.find((model) => model.id === modelId)
    if (cachedModel) return cachedModel
  }

  // Fall back to all static models for immediate lookup (including Mistral)
  return STATIC_MODELS.find((model) => model.id === modelId)
}

// Function to get all models including hidden ones (for internal use)
export function getAllModelsIncludingHidden(): ModelConfig[] {
  return STATIC_MODELS
}

// For backward compatibility - static models only
export const MODELS: ModelConfig[] = STATIC_MODELS

// Function to refresh the models cache
export function refreshModelsCache(): void {
  dynamicModelsCache = null
  lastFetchTime = 0
}
