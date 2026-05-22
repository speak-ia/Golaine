import type { AgentConfig } from "./types";

export function createDefaultAgentConfig(businessName: string): AgentConfig {
  const name = businessName.trim() || "votre entreprise";
  return {
    agentName: "Assistant",
    instructions: `Tu es l'assistante de ${name}.\nTu réponds aux questions sur nos produits et services.\nTu es professionnelle, chaleureuse et concise.`,
    notificationNumber: "",
    autoResponse: true,
    welcomeMessage: `Bonjour ! 👋 Bienvenue chez ${name}. Comment puis-je vous aider aujourd'hui ?`,
    workingHours: false,
    startTime: "08:00",
    endTime: "20:00",
    timezone: "Africa/Dakar",
    language: "fr",
    fallbackToHuman: false,
  };
}
