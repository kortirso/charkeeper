# frozen_string_literal: true

module WebhooksContext
  module Telegram
    class ReceiveMessageWebhookCommand < BaseCommand
      include Deps[handle_service: 'services.bot_context.handle']

      use_contract do
        params do
          required(:message).hash do
            required(:message_id).filled(:integer)
            required(:from).hash do
              optional(:id).filled(:integer)
              optional(:first_name).filled(:string)
              optional(:last_name).filled(:string)
              optional(:username).filled(:string)
              optional(:language_code).filled(:string)
            end
            required(:chat).hash do
              required(:id).filled(:integer)
            end
            required(:text).filled(:string)
          end
        end
      end

      private

      def do_persist(input)
        define_locale(input[:message])
        handle_service.call(
          source: input.dig(:message, :chat, :id).positive? ? :telegram_bot : :telegram_group_bot,
          message: input[:message][:text],
          data: { raw_message: input[:message], user: identity(input[:message])&.user }.compact
        )

        { result: :ok }
      end

      def define_locale(message)
        message_locale = message.dig(:from, :language_code)&.to_sym || :en
        I18n.locale = I18n.available_locales.include?(message_locale) ? message_locale : I18n.default_locale
      end

      def identity(message)
        User::Identity.find_by(provider: User::Identity::TELEGRAM, uid: message.dig(:chat, :id).to_s)
      end
    end
  end
end
