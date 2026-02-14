# frozen_string_literal: true

module BotContextV2
  class HandleCommandService
    include Deps[
      default_roll_command: 'services.bot_context_v2.commands.rolls.default',
      duality_roll_command: 'services.bot_context_v2.commands.rolls.duality',
      fate_roll_command: 'services.bot_context_v2.commands.rolls.fate',
      check_command: 'services.bot_context_v2.commands.check'
    ]

    def call(command:, arguments:, character:)
      case command
      when '/roll' then default_roll_command.call(arguments: arguments)
      when '/dualityRoll' then duality_roll_command.call(arguments: arguments)
      when '/fateRoll' then fate_roll_command.call(arguments: arguments)
      when '/check' then check_command.call(arguments: arguments, character: character)
      end
    end
  end
end
