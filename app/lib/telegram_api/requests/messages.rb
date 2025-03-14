# frozen_string_literal: true

module TelegramApi
  module Requests
    module Messages
      def send_message(bot_secret:, chat_id:, text:)
        post(
          path: "bot#{bot_secret}/sendMessage?chat_id=#{chat_id}",
          body: {
            text: text
          }.to_json,
          headers: headers
        )
      end
    end
  end
end
