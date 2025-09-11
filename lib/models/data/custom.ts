import { openproviders } from "@/lib/openproviders"
import { ModelConfig } from "../types"

const customModels: ModelConfig[] = [
  {
    id: "harvestor",
    name: "Harvestor",
    provider: "inVerus",
    providerId: "inverus",
    modelFamily: "Custom",
    description: "Fast and efficient model optimized for data harvesting and processing tasks",
    tags: ["fast", "efficient", "data-processing"],
    contextWindow: 128000,
    inputCost: 1.0,
    outputCost: 2.0,
    priceUnit: "per 1M tokens",
    vision: false,
    tools: true,
    audio: false,
    reasoning: true,
    openSource: false,
    speed: "Fast",
    intelligence: "High",
    website: "https://inverus.com",
    apiDocs: "https://docs.inverus.com/models",
    modelPage: "https://inverus.com/models/harvestor",
    releasedAt: "2024-01-01",
    icon: "harvestor",
    apiSdk: (apiKey?: string) =>
      openproviders("harvestor", undefined, apiKey),
    accessible: true
  },
  {
    id: "consortium",
    name: "Consortium",
    provider: "inVerus",
    providerId: "inverus", 
    modelFamily: "Custom",
    description: "Advanced collaborative model designed for complex reasoning and multi-step analysis",
    tags: ["reasoning", "collaborative", "advanced"],
    contextWindow: 256000,
    inputCost: 2.0,
    outputCost: 4.0,
    priceUnit: "per 1M tokens",
    vision: true,
    tools: true,
    audio: false,
    reasoning: true,
    openSource: false,
    speed: "Medium",
    intelligence: "High",
    website: "https://inverus.com",
    apiDocs: "https://docs.inverus.com/models",
    modelPage: "https://inverus.com/models/consortium",
    releasedAt: "2024-01-01",
    icon: "consortium",
    apiSdk: (apiKey?: string) =>
      openproviders("consortium", undefined, apiKey),
    accessible: true
  }
]

export { customModels }
