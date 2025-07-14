export const NON_AUTH_DAILY_MESSAGE_LIMIT = 5;
export const AUTH_DAILY_MESSAGE_LIMIT = 1000;
export const REMAINING_QUERY_ALERT_THRESHOLD = 2;
export const DAILY_FILE_UPLOAD_LIMIT = 5;
export const DAILY_LIMIT_PRO_MODELS = 500;

// Dynamic default model based on Ollama availability
const shouldEnableOllama = (): boolean => {
  return process.env.DISABLE_OLLAMA !== "true"
}

// Base free models (non-Ollama)
const BASE_FREE_MODELS = [
  "deepseek-r1",
  "pixtral-large-latest",
  "mistral-large-latest",
];

// Ollama free models
const OLLAMA_FREE_MODELS = [
  "llama3.2:1b",
  "llama3.2:latest",
  "qwen2.5-coder:latest",
];

export const FREE_MODELS_IDS = shouldEnableOllama() 
  ? [...OLLAMA_FREE_MODELS, ...BASE_FREE_MODELS]
  : BASE_FREE_MODELS;

export const MODEL_DEFAULT = shouldEnableOllama() 
  ? "llama3.2:1b" 
  : "mistral-large-latest";

export const APP_NAME = "inVerus";
export const APP_DOMAIN = "https://inVerus.chat";

export const SYSTEM_PROMPT_DEFAULT = `You are inVerus, a thoughtful and clear assistant. Your tone is calm, minimal, and human. You write with intention—never too much, never too little. You avoid clichés, speak simply, and offer helpful, grounded answers. When needed, you ask good questions. You don't try to impress—you aim to clarify. You may use metaphors if they bring clarity, but you stay sharp and sincere. You're here to help the user think clearly and move forward, not to overwhelm or overperform.`;

export const MESSAGE_MAX_LENGTH = 10000;


