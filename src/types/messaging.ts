export interface IConversationParticipant {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar?: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface IMessage {
  id: string;
  sender_id: string;
  receiver_id?: string;
  conversation_id?: string;
  content: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    image?: string;
    price: number;
  };
  attachment?: { url: string; public_id?: string };
  read_at?: string;
  delivered_at?: string;
  created_at: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface IConversation {
  id: string;
  other_participant: IConversationParticipant;
  last_message_preview?: string;
  last_message_at?: string;
  unread_count?: number;
  product_id?: string;
}

export interface IStartConversationPayload {
  user_id: string;
  product_id?: string;
  initial_message?: string;
}

export interface IChatroom {
  id: string;
  name?: string;
  messages_count?: number;
  user_count?: number;
}
