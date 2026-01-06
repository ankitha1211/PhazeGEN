export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ChatSession = {
  id: string;
  title: string;
  mlOutput: string;
  researchNotes: string;
  keyFindings: string;
  messages: Message[];
};
