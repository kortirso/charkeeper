# frozen_string_literal: true

module BotContext
  class HandleCommandService
    include Deps[
      roll_command: 'services.bot_context.commands.roll',
      duality_roll_command: 'services.bot_context.commands.duality_roll',
      check_command: 'services.bot_context.commands.check',
      campaign_command: 'services.bot_context.commands.campaign',
      character_command: 'services.bot_context.commands.character'
    ]

    def call(source:, command:, arguments:, data:)
      case command
      when '/roll' then roll_command.call(arguments: arguments)
      when '/dualityRoll' then duality_roll_command.call(arguments: arguments)
      when '/check' then check_command.call(source: source, arguments: arguments, data: data)
      when '/campaign' then campaign_command.call(source: source, arguments: arguments, data: data)
      when '/character' then character_command.call(source: source, arguments: arguments, data: data)
      end
    end
  end
end
