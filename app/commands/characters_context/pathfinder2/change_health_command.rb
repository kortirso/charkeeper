# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    class ChangeHealthCommand < BaseCommand
      include Deps[
        update_command: 'commands.characters_context.pathfinder2.update'
      ]

      use_contract do
        config.messages.namespace = :pathfinder2_character

        params do
          required(:character).filled(type?: ::Pathfinder2::Character)
          required(:value).filled(:integer)
        end
      end

      private

      # rubocop: disable Metrics/AbcSize
      def do_prepare(input)
        health = input[:character].data.health

        if input[:value].negative?
          damage_value = input[:value].abs
          current_health = health['current'] + health['temp']
          return letal_damage(input) if damage_value - current_health >= health['max']

          if current_health.positive?
            simple_damage(input, health, damage_value)
          else
            letal_hit(input, input[:character].data.dying_condition_value)
          end
        elsif input[:value].positive?
          healing(input, health, [health['max'] - health['current'], input[:value]].min)
        end
      end
      # rubocop: enable Metrics/AbcSize

      def do_persist(input)
        return if input[:value].zero?

        update_command.call({
          character: input[:character],
          health: input[:health].merge({ max: input[:character].data.health['max'] }),
          dying_condition_value: input[:dying_condition_value]
        })
      end

      def simple_damage(input, health, damage_value)
        damage_to_temp_health = [damage_value, health['temp']].min
        damage_to_health = damage_value - damage_to_temp_health
        input[:health] = {
          current: (damage_to_health >= health['current'] ? 0 : health['current'] - damage_to_health),
          temp: health['temp'] - damage_to_temp_health
        }
        input[:dying_condition_value] = 0
      end

      def letal_damage(input)
        input[:health] = { current: 0, temp: 0 }
        input[:dying_condition_value] = 4
      end

      def letal_hit(input, current_dying_condition_value)
        input[:health] = { current: 0, temp: 0 }
        input[:dying_condition_value] = current_dying_condition_value + 1
      end

      def healing(input, health, healing_value)
        input[:health] = { current: health['current'] + healing_value, temp: health['temp'] }
        input[:dying_condition_value] = 0
      end
    end
  end
end
