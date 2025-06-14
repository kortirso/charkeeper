# frozen_string_literal: true

module WebhooksContext
  class HandleTelegramChatMemberWebhookService
    def call(chat_member:)
      identity = find_identity(chat_member)
      identity&.update(active: active?(chat_member))
    end

    private

    def find_identity(chat_member)
      User::Identity.find_by(provider: User::Identity::TELEGRAM, uid: chat_member.dig(:chat, :id).to_s)
    end

    def active?(chat_member)
      case chat_member.dig(:new_chat_member, :status)
      when 'member' then true
      else false
      end
    end
  end
end
