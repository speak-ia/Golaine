import type { Conversation, Message } from "@shared/types/domainTypes";

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: "Fatou Diallo",
    phone: "+221 77 234 56 78",
    lastMessage: "D'accord, je confirme la commande !",
    time: "14:32",
    unread: 2,
    status: "active",
    avatar: "FD",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    id: 2,
    name: "Moussa Traoré",
    phone: "+225 07 89 12 34",
    lastMessage: "C'est combien le sac à main ?",
    time: "13:15",
    unread: 0,
    status: "active",
    avatar: "MT",
    gradient: "from-amber-500 to-orange-600",
  },
];

export const MOCK_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, sender: "client", text: "Bonjour ! Je voudrais commander 3 robes wax", time: "14:20" },
    {
      id: 2,
      sender: "agent",
      text: "Bonjour Fatou ! Avec plaisir. Les robes Wax sont à 5 000 FCFA chacune.",
      time: "14:21",
    },
    { id: 3, sender: "client", text: "D'accord, je confirme la commande !", time: "14:32" },
  ],
  2: [
    { id: 4, sender: "client", text: "Bonjour, quels sacs à main avez-vous ?", time: "13:00" },
    { id: 5, sender: "client", text: "C'est combien le sac à main ?", time: "13:15" },
  ],
};
