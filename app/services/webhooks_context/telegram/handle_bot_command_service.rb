# frozen_string_literal: true

module WebhooksContext
  module Telegram
    class HandleBotCommandService < WebhooksContext::HandleBotCommandService
      private

      # { rolls: rolls, total: total }
      def represent_roll_command_result(result)
        formatted_result = result[:rolls].map { |item| "#{item[0]} (#{item[1]})" }.join(', ')
        "*Result*: #{formatted_result}\n*Total*: #{result[:total]}"
      end
    end
  end
end
