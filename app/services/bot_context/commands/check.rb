# frozen_string_literal: true

module BotContext
  module Commands
    class Check
      include Deps[roll_command: 'services.bot_context.commands.roll']

      def call(source:, arguments:, data:) # rubocop: disable Lint/UnusedMethodArgument
        return if data[:user].nil?
        return if data[:character].nil?

        # ap data[:character]
        # ap arguments

        {
          type: 'check',
          result: roll_command.call(arguments: %w[d20 4])[:result],
          errors: nil
        }
      end
    end
  end
end
