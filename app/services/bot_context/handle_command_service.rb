# frozen_string_literal: true

module BotContext
  class HandleCommandService
    include Deps[roll_command: 'services.bot_context.commands.roll']

    def call(command:, arguments:)
      case command
      when '/roll' then roll_command.call(arguments: arguments)
      end
    end
  end
end
