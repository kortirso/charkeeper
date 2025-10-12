# frozen_string_literal: true

module BotContext
  module Commands
    module Checks
      class Daggerheart
        include Deps[roll_command: 'services.bot_context.commands.roll']

        def call(character:, arguments: [])
          type = arguments.shift
          target = arguments.shift
          result =
            case type
            when 'attr', 'attack' then attr_check(character, target, arguments)
            end

          {
            type: type,
            target: target,
            result: result,
            errors: nil
          }
        end

        private

        def attr_check(_character, _target, arguments)
          values = rolls(arguments)
          {
            rolls: [values.dig(0, :rolls, 0), values.dig(1, :rolls, 0), values&.dig(2, :rolls, 0)].compact,
            total: values[3],
            status: status(values.dig(0, :total), values.dig(1, :total))
          }
        end

        def rolls(arguments) # rubocop: disable Metrics/AbcSize
          values = BotContext::Commands::Parsers::MakeCheck.new.call(arguments: arguments) # { adv: 1, bonus: 1 }

          hope_check = roll_command.call(arguments: ['d12'])[:result]
          fear_check = roll_command.call(arguments: ['d12'])[:result]
          adv_check = roll_command.call(arguments: ['d6'])[:result] unless values[:adv].to_i.zero?

          total = hope_check[:total] + fear_check[:total] + adv_check&.dig(:total).to_i + values[:bonus].to_i

          [hope_check, fear_check, adv_check, total]
        end

        def status(hope_value, fear_value)
          return :crit_success if hope_value == fear_value

          hope_value > fear_value ? :with_hope : :with_fear
        end
      end
    end
  end
end
