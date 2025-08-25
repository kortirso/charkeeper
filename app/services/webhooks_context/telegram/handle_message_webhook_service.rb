# frozen_string_literal: true

module WebhooksContext
  module Telegram
    class HandleMessageWebhookService
      include Deps[
        telegram_api: 'api.telegram.client',
        add_identity: 'commands.auth_context.add_identity'
      ]

      def call(message:)
        define_locale(message)
        route_message(message)
      end

      private

      def define_locale(message)
        message_locale = message.dig(:from, :language_code).to_sym
        I18n.locale = I18n.available_locales.include?(message_locale) ? message_locale : I18n.default_locale
      end

      # rubocop: disable Metrics/AbcSize
      def route_message(message)
        case message[:text]
        when '/start'
          identity = find_identity(message) || create_identity(message)
          identity.update(active: true) unless identity&.active?
          identity.user.update(discarded_at: nil)
          send_start_message(message[:from], message[:chat])
        when '/contacts' then send_contacts_message(message[:chat])
        when '/unsubscribe'
          find_identity(message)&.update(active: false)
          send_unsubscribe_message(message[:chat])
        when '/subscribe'
          find_identity(message)&.update(active: true)
          send_subscribe_message(message[:chat])
        else send_unknown_message(message[:chat])
        end
      end
      # rubocop: enable Metrics/AbcSize

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

      def send_start_message(sender, chat)
        telegram_api.send_message(
          bot_secret: bot_secret,
          chat_id: chat[:id],
          text: I18n.t('telegram_webhook.start', sender: sender[:username])
        )
      end

      def send_contacts_message(chat)
        telegram_api.send_message(
          bot_secret: bot_secret,
          chat_id: chat[:id],
          text: I18n.t('telegram_webhook.contacts')
        )
      end

      def send_unsubscribe_message(chat)
        telegram_api.send_message(
          bot_secret: bot_secret,
          chat_id: chat[:id],
          text: I18n.t('telegram_webhook.unsubscribe')
        )
      end

      def send_subscribe_message(chat)
        telegram_api.send_message(
          bot_secret: bot_secret,
          chat_id: chat[:id],
          text: I18n.t('telegram_webhook.subscribe')
        )
      end

      def send_unknown_message(chat)
        telegram_api.send_message(
          bot_secret: bot_secret,
          chat_id: chat[:id],
          text: I18n.t('telegram_webhook.unknown')
        )
      end

      def bot_secret
        @bot_secret ||= Rails.application.credentials.dig(Rails.env.to_sym, :web_telegram_bot_token)
      end
    end
  end
end
