# frozen_string_literal: true

module TelegramApi
  module Requests
    module Messages
      def send_message(bot_secret:, chat_id:, text:, reply_to_message_id: nil)
        post(
          path: "bot#{bot_secret}/sendMessage",
          body: {
            text: text
          },
          params: {
            chat_id: chat_id,
            reply_to_message_id: reply_to_message_id
          }.compact,
          headers: headers
        )
      end
    end
  end
end
