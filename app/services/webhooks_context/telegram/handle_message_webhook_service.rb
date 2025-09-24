# frozen_string_literal: true

module WebhooksContext
  module Telegram
    class HandleMessageWebhookService
      include Deps[
        telegram_api: 'api.telegram.client',
        add_identity: 'commands.auth_context.add_identity'
      ]

      # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity
      def call(message:)
        case message[:text]
        when '/start'
          identity = find_identity(message) || create_identity(message)
          identity.update(active: true) unless identity&.active?
          identity.user.update(discarded_at: nil)
          send_message(message[:chat], I18n.t('telegram_webhook.start', sender: message.dig(:from, :username)))
        when '/contacts' then send_message(message[:chat], I18n.t('telegram_webhook.contacts'))
        when '/unsubscribe'
          find_identity(message)&.update(active: false)
          send_message(message[:chat], I18n.t('telegram_webhook.unsubscribe'))
        when '/subscribe'
          find_identity(message)&.update(active: true)
          send_message(message[:chat], I18n.t('telegram_webhook.subscribe'))
        when '/commands' then send_message(message[:chat], I18n.t('telegram_webhook.commands'))
        when '/help' then send_message(message[:chat], I18n.t('telegram_webhook.help'))
        else send_message(message[:chat], I18n.t('telegram_webhook.unknown'))
        end
      end
      # rubocop: enable Metrics/AbcSize, Metrics/CyclomaticComplexity

      private

      def find_identity(message)
        User::Identity.find_by(provider: User::Identity::TELEGRAM, uid: message.dig(:chat, :id).to_s)
      end

      def create_identity(message)
        add_identity.call({
          provider: User::Identity::TELEGRAM,
          uid: message.dig(:chat, :id).to_s,
          first_name: message.dig(:from, :first_name),
          last_name: message.dig(:from, :last_name),
          username: message.dig(:from, :username),
          locale: I18n.locale.to_s
        })[:result]
      end

      def send_message(chat, message)
        telegram_api.send_message(bot_secret: bot_secret, chat_id: chat[:id], text: message)
      end

      def bot_secret
        @bot_secret ||= Rails.application.credentials.dig(Rails.env.to_sym, :web_telegram_bot_token)
      end
    end
  end
end
