# frozen_string_literal: true

module WebhooksContext
  module Telegram
    class HandleBotCommandService < WebhooksContext::HandleBotCommandService
      private

      # { rolls: rolls, total: total }
      def represent_roll_command_result(result)
        formatted_result = result[:rolls].map { |item| "#{item[0]} (#{item[1]})" }.join(', ')
        "<b>Result</b>: #{formatted_result}\n<b>Total</b>: #{result[:total]}"
      end
    end
  end
end
