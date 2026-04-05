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

      def do_prepare(input) # rubocop: disable Metrics/AbcSize
        health_current = input[:character].data.health_current
        health_temp = input[:character].data.health_temp

        if input[:value].negative?
          damage_value = input[:value].abs
          if health_temp >= damage_value
            input[:health] = { temp: health_temp - damage_value }
          else
            real_damage = damage_value - health_temp
            input[:health] = { temp: 0, current: [health_current - real_damage, 0].max }
          end
        elsif input[:value].positive?
          input[:health] = { current: health_current + input[:value] }
        end
      end

      def do_persist(input)
        return if input[:value].zero?

        update_command.call({ character: input[:character], health: input[:health] })
      end
    end
  end
end
