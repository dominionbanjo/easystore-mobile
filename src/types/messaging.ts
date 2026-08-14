export interface IConversationParticipant {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  avatar?: string;
  account_type?: string;
  store_name?: string | null;
  store_slug?: string | null;
  created_at?: string;
}

export interface IMessage {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  conversation_id: string | null;
  is_public: boolean;
  content: string;
  product_id?: string | null;
  product_name?: string | null;
  product_image?: string | null;
  product_slug?: string | null;
  read_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
  updated_at?: string;
  sender?: IConversationParticipant | null;
  read_count?: number;
  local_id?: string;
}

export interface IConversation {
  id: string;
  other_participant: IConversationParticipant | null;
  last_message_preview?: string | null;
  last_message_at?: string | null;
  unread_count: number;
  created_at: string;
}

/** Raw Conversation entity returned by `POST messaging/conversations`. */
export interface IConversationEntity {
  id: string;
  participant_one_id: string;
  participant_two_id: string;
  participant_one_unread: number;
  participant_two_unread: number;
  last_message_preview?: string | null;
  last_message_at?: string | null;
  created_at: string;
  updated_at: string;
}

/** Backend DTO requires `recipient_id` (whitelist rejects anything else). */
export interface IStartConversationPayload {
  recipient_id: string;
}
