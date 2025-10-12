# frozen_string_literal: true

module BotContext
  class HandleCommandService
    include Deps[
      roll_command: 'services.bot_context.commands.roll',
      homebrew_command: 'services.bot_context.commands.homebrew',
      book_command: 'services.bot_context.commands.book',
      check_command: 'services.bot_context.commands.check',
      campaign_command: 'services.bot_context.commands.campaign'
    ]

    def call(source:, command:, arguments:, data:)
      case command
      when '/roll' then roll_command.call(arguments: arguments)
      when '/homebrew' then homebrew_command.call(source: source, arguments: arguments, data: data)
      when '/module' then book_command.call(source: source, arguments: arguments, data: data)
      when '/check' then check_command.call(source: source, arguments: arguments, data: data)
      when '/campaign' then campaign_command.call(source: source, arguments: arguments, data: data)
      end
    end
  end
end
