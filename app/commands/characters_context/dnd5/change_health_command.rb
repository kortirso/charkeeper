# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class ChangeHealthCommand < BaseCommand
      include Deps[
        dnd5_update: 'commands.characters_context.dnd5.update',
        dnd2024_update: 'commands.characters_context.dnd2024.update'
      ]

      use_contract do
        config.messages.namespace = :dnd5_character

        params do
          required(:character).filled(type_included_in?: [::Dnd5::Character, ::Dnd2024::Character])
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
            letal_hit(input, input[:character].data.death_saving_throws)
          end
        elsif input[:value].positive?
          healing(input, health, [health['max'] - health['current'], input[:value]].min)
        end
      end
      # rubocop: enable Metrics/AbcSize

      def do_persist(input)
        return if input[:value].zero?

        perform_command(input).call({
          character: input[:character],
          health: input[:health].merge({ max: input[:character].data.health['max'] }),
          death_saving_throws: input[:death_saving_throws]
        })
      end

      def simple_damage(input, health, damage_value)
        damage_to_temp_health = [damage_value, health['temp']].min
        damage_to_health = damage_value - damage_to_temp_health
        input[:health] = {
          current: (damage_to_health >= health['current'] ? 0 : health['current'] - damage_to_health),
          temp: health['temp'] - damage_to_temp_health
        }
        input[:death_saving_throws] = { success: 0, failure: 0 }
      end

      def letal_damage(input)
        input[:health] = { current: 0, temp: 0 }
        input[:death_saving_throws] = { success: 0, failure: 3 }
      end

      def letal_hit(input, current_death)
        input[:health] = { current: 0, temp: 0 }
        input[:death_saving_throws] = { success: current_death['success'], failure: [current_death['failure'] + 1, 3].min }
      end

      def healing(input, health, healing_value)
        input[:health] = { current: health['current'] + healing_value, temp: health['temp'] }
        input[:death_saving_throws] = { success: 0, failure: 0 }
      end

      def perform_command(input)
        case input[:character].class.name
        when 'Dnd5::Character' then dnd5_update
        when 'Dnd2024::Character' then dnd2024_update
        end
      end
    end
  end
end
