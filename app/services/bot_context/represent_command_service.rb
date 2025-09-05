# frozen_string_literal: true

module BotContext
  class RepresentCommandService
    include Deps[roll_command: 'services.bot_context.representers.roll']

    def call(source:, command:, command_result:)
      case command
      when '/roll' then roll_command.call(source: source, command_result: command_result)
      end
    end
  end
end
