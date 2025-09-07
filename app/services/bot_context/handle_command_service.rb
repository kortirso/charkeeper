# frozen_string_literal: true

module BotContext
  class HandleCommandService
    include Deps[
      roll_command: 'services.bot_context.commands.roll',
      book_command: 'services.bot_context.commands.book'
    ]

    def call(source:, command:, arguments:, data:)
      case command
      when '/roll' then roll_command.call(arguments: arguments)
      when '/module' then book_command.call(source: source, arguments: arguments, data: data)
      end
    end
  end
end
