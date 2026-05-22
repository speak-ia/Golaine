export type { AgentIA } from "@shared/types/domainTypes";

export type AgentSlotStatus = "connected" | "inactive" | "locked";

export type AgentConfig = {
  agentName: string;
  instructions: string;
  notificationNumber: string;
  autoResponse: boolean;
  welcomeMessage: string;
  workingHours: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
  language: "fr" | "en" | "wo" | "ar";
  fallbackToHuman: boolean;
};

export type AgentSlotTab = {
  slotIndex: number;
  displayName: string;
  phone: string | null;
  status: AgentSlotStatus;
  conversations: number;
};

export type AgentsPageData = {
  slots: AgentSlotTab[];
  configs: Record<number, AgentConfig>;
  businessName: string;
  maxSlots: number;
};

export type SectionTab = "general" | "messages" | "horaires" | "avance";
