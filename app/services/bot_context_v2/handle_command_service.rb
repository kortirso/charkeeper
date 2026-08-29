# frozen_string_literal: true

module BotContextV2
  class HandleCommandService
    include Deps[
      default_roll_command: 'services.bot_context_v2.commands.rolls.default',
      duality_roll_command: 'services.bot_context_v2.commands.rolls.duality',
      fate_roll_command: 'services.bot_context_v2.commands.rolls.fate',
      cosmere_roll_command: 'services.bot_context_v2.commands.rolls.cosmere',
      nimble_attack_command: 'services.bot_context_v2.commands.rolls.nimble_attack',
      pf2_attack_command: 'services.bot_context_v2.commands.rolls.pf2_attack',
      dnd_attack_command: 'services.bot_context_v2.commands.rolls.dnd_attack',
      check_command: 'services.bot_context_v2.commands.check'
    ]

    def call(command:, arguments:, character:)
      case command
      when '/roll' then default_roll_command.call(arguments: arguments)
      when '/dualityRoll' then duality_roll_command.call(arguments: arguments)
      when '/fateRoll' then fate_roll_command.call(arguments: arguments)
      when '/plotRoll' then cosmere_roll_command.call(arguments: arguments)
      when '/check' then check_command.call(arguments: arguments, character: character)
      when '/nimbleAttack' then nimble_attack_command.call(arguments: arguments)
      when '/pf2Attack' then pf2_attack_command.call(arguments: arguments)
      when '/dndAttack' then dnd_attack_command.call(arguments: arguments)
      end
    end
  end
end
