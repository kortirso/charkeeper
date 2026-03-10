# frozen_string_literal: true

module BotContextV2
  module Commands
    module Checks
      class Fallout
        include Deps[roll_command: 'services.bot_context_v2.commands.rolls.default']

        def call(arguments: [])
          type = arguments.shift
          target = arguments.shift
          result =
            case type
            when 'skill' then check_skill(arguments)
            when 'damage' then check_damage(arguments)
            end

          {
            type: type,
            target: target,
            result: result,
            errors: nil
          }
        end

        private

        def check_skill(arguments)
          values = skill_rolls(arguments)
          {
            rolls: values[..-3],
            successes: values[-2],
            complications: values[-1]
          }
        end

        def check_damage(arguments)
          values = BotContextV2::Commands::Parsers::MakeCheck.new.call(arguments: arguments)

          character_item = values[:id] ? Character::Item.find_by(id: values[:id]) : nil
          result = { damage: 0, effects: 0 }
          values[:target].times do
            check_damage_roll_result(roll_command.call(arguments: ['d6']).dig(:result, :total), result)
          end
          modify_result_by_effects(result, character_item)
          result.except(:effects)
        end

        def skill_rolls(arguments)
          values = BotContextV2::Commands::Parsers::MakeCheck.new.call(arguments: arguments) # { bonus: 1 }

          rolls = []
          successes = 0
          complications = 0

          (2 + values[:bonus].to_i).times do
            roll_result = roll_command.call(arguments: ['d20'])[:result]
            rolls << roll_result
            successes, complications =
              check_roll_result(roll_result[:total], values[:target], values[:expertise], successes, complications)
          end

          [rolls, successes, complications].flatten
        end

        def check_roll_result(roll_result, target, expertise, successes, complications)
          complications += 1 if roll_result == 20
          successes += 2 if roll_result <= expertise
          successes += 1 if roll_result > expertise && roll_result <= target

          [successes, complications]
        end

        def check_damage_roll_result(roll_result, result)
          if roll_result >= 5
            result[:damage] += 1
            result[:effects] += 1
          end
          result[:damage] += 1 if roll_result == 1
          result[:damage] += 2 if roll_result == 2
        end

        def modify_result_by_effects(result, character_item) # rubocop: disable Metrics/AbcSize
          return unless character_item

          effects = character_item.item.info['effects']
          return if result[:effects].zero?

          result[:damage] += result[:effects] if effects.include?('vicious')
          if effects.include?('spread')
            result[:spread_targets] = result[:effects]
            result[:spread] = result[:damage] / 2
          end
          result[:radioactive] = result[:effects] if effects.include?('radioactive')
          result[:burst] = result[:effects] if effects.include?('burst')
        end
      end
    end
  end
end
