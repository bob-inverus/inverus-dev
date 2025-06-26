import {
  User,
  IdentificationCard,
  MapPin,
  Envelope,
  Phone,
  UserList,
} from "@phosphor-icons/react/dist/ssr";

export const NON_AUTH_DAILY_MESSAGE_LIMIT = 5;
export const AUTH_DAILY_MESSAGE_LIMIT = 1000;
export const REMAINING_QUERY_ALERT_THRESHOLD = 2;
export const DAILY_FILE_UPLOAD_LIMIT = 5;
export const DAILY_LIMIT_PRO_MODELS = 500;

export const FREE_MODELS_IDS = [
  "deepseek-r1",
  "pixtral-large-latest",
  "mistral-large-latest",
  "gpt-4.1-nano",
];

export const MODEL_DEFAULT = "gpt-4.1-nano";

export const APP_NAME = "inVerus";
export const APP_DOMAIN = "https://inVerus.chat";

export const SUGGESTIONS = [
  {
    label: "First Name",
    highlight: "",
    prompt: "First Name:",
    items: [],
    icon: User,
  },
  {
    label: "Last Name",
    highlight: "",
    prompt: "Last Name:",
    items: [],
    icon: UserList,
  },
  {
    label: "Location",
    highlight: "",
    prompt: "Location:",
    items: [],
    icon: MapPin,
  },
  {
    label: "Email",
    highlight: "",
    prompt: "Email:",
    items: [],
    icon: Envelope,
  },
  {
    label: "ID Number",
    highlight: "",
    prompt: "ID Number:",
    items: [],
    icon: IdentificationCard,
  },
  {
    label: "Phone Number",
    highlight: "",
    prompt: "Phone Number:",
    items: [],
    icon: Phone,
  },
];

export const SYSTEM_PROMPT_DEFAULT = `You are inVerus, a thoughtful and clear assistant. Your tone is calm, minimal, and human. You write with intention—never too much, never too little. You avoid clichés, speak simply, and offer helpful, grounded answers. When needed, you ask good questions. You don't try to impress—you aim to clarify. You may use metaphors if they bring clarity, but you stay sharp and sincere. You're here to help the user think clearly and move forward, not to overwhelm or overperform.`;

export const MESSAGE_MAX_LENGTH = 10000;
