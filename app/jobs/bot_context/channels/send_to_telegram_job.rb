# frozen_string_literal: true

module BotContext
  module Channels
    class SendToTelegramJob < ApplicationJob
      queue_as :default

      def perform(chat_id, text)
        Charkeeper::Container.resolve('api.telegram.client').send_message(
          bot_secret: bot_secret,
          chat_id: chat_id,
          text: text
        )
      end

      private

      def bot_secret
        Rails.application.credentials.dig(Rails.env.to_sym, :web_telegram_bot_token)
      end
    end
  end
end
