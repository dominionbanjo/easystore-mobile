import { apiManager } from './client';
import type { MessageOnlyResponse, IPaginatedData } from '@/types/api';
import type {
  IConversation,
  IConversationEntity,
  IMessage,
  IStartConversationPayload,
} from '@/types/messaging';
import type { IProduct } from '@/types/product';

export const messagingApi = apiManager.injectEndpoints({
  endpoints: (build) => ({
    getConversations: build.query<IConversation[], void>({
      query: () => 'messaging/conversations',
      providesTags: ['Messaging'],
    }),
    getConversation: build.query<IConversation, string>({
      query: (id) => `messaging/conversations/${id}`,
      providesTags: ['Messaging'],
    }),
    getMessages: build.query<IPaginatedData<IMessage>, { conversationId: string; page?: number }>({
      query: ({ conversationId, page = 1 }) =>
        `messaging/conversations/${conversationId}/messages?page=${page}`,
      providesTags: ['Messaging'],
    }),
    startConversation: build.mutation<IConversationEntity, IStartConversationPayload>({
      query: (body) => ({ url: 'messaging/conversations', method: 'POST', body }),
      invalidatesTags: ['Messaging'],
    }),
    sendMessage: build.mutation<
      IMessage,
      { conversationId: string; content: string; product_id?: string; local_id?: string }
    >({
      query: ({ conversationId, ...body }) => ({
        url: `messaging/conversations/${conversationId}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Messaging'],
    }),
    markConversationRead: build.mutation<MessageOnlyResponse, string>({
      query: (conversationId) => ({
        url: `messaging/conversations/${conversationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Messaging'],
    }),
    getChatroom: build.query<IPaginatedData<IMessage>, { page?: number }>({
      query: ({ page = 1 } = {}) => `messaging/chatroom?page=${page}`,
      providesTags: ['Messaging'],
    }),
    getChatroomMessages: build.query<IPaginatedData<IMessage>, { page?: number }>({
      query: ({ page = 1 } = {}) => `messaging/chatroom?page=${page}`,
      providesTags: ['Messaging'],
    }),
    searchUsersForChat: build.query<
      { id: string; first_name: string; last_name: string; avatar?: string }[],
      string
    >({
      query: (q) => `users?search=${encodeURIComponent(q)}&limit=10`,
      transformResponse: (response: IPaginatedData<{ id: string; first_name: string; last_name: string; avatar?: string }>) =>
        response.items,
      providesTags: ['User'],
    }),
    getChatroomProductCatalog: build.query<IPaginatedData<IProduct>, { page?: number }>({
      query: ({ page = 1 } = {}) => `product?page=${page}&limit=20`,
      providesTags: ['Product'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useGetMessagesQuery,
  useStartConversationMutation,
  useSendMessageMutation,
  useMarkConversationReadMutation,
  useGetChatroomQuery,
  useGetChatroomMessagesQuery,
  useSearchUsersForChatQuery,
  useGetChatroomProductCatalogQuery,
} = messagingApi;
