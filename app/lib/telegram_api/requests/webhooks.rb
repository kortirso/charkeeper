# frozen_string_literal: true

module TelegramApi
  module Requests
    module Webhooks
      def get_webhook(bot_secret:)
        get(
          path: "bot#{bot_secret}/getWebhookInfo",
          headers: headers
        )
      end

      def set_webhook(bot_secret:, url:, secret_token:)
        get(
          path: "bot#{bot_secret}/setWebhook?url=#{url}&secret_token=#{secret_token}",
          headers: headers
        )
      end

      def delete_webhook(bot_secret:)
        get(
          path: "bot#{bot_secret}/setWebhook?url=",
          headers: headers
        )
      end
    end
  end
end
