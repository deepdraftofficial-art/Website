export interface UserProfile {
  uid: string;
  email: string | null;
  credits: number;
  subscriptionTier: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}
