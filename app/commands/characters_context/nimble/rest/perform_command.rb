# frozen_string_literal: true

module CharactersContext
  module Nimble
    module Rest
      class PerformCommand < BaseCommand
        include Deps[
          character_update: 'commands.characters_context.nimble.update',
          roll: 'roll'
        ]

        RESTORE_REST_POINTS = %w[safe_rest].freeze

        use_contract do
          Rests = Dry::Types['strict.string'].enum('combat_rest', 'field_rest', 'long_field_rest', 'safe_rest')

          params do
            required(:character).filled(type?: ::Nimble::Character)
            required(:value).filled(Rests)
            required(:hit_die_spend).filled(:integer, gteq?: 0)
            required(:hit_die).filled(:integer, gt?: 0)
            required(:make_rolls).filled(:bool)
          end
        end

        private

        def lock_key(input) = "character_update_#{input[:character].id}"
        def lock_time = 0

        def do_prepare(input) # rubocop: disable Metrics/AbcSize
          input[:data] = { health: {} }
          return if input[:value] == 'combat_rest'

          data = input[:character].data

          case input[:value]
          when 'field_rest'
            input[:recovery] = roll.call(dice: "#{input[:hit_die_spend]}d#{input[:hit_die]}") if input[:make_rolls]
            input[:data][:hit_die_spent] = data.hit_die_spent + input[:hit_die_spend]

            current = [data.health['current'] + input[:recovery], data.health['max']].min
            input[:data][:health] = { current: current, temp: data.health['temp'], max: data.health['max'] }
          when 'long_field_rest'
            input[:recovery] = input[:hit_die_spend] * input[:hit_die] if input[:make_rolls]
            input[:data][:hit_die_spent] = data.hit_die_spent + input[:hit_die_spend]

            current = [data.health['current'] + input[:recovery], data.health['max']].min
            input[:data][:health] = { current: current, temp: data.health['temp'], max: data.health['max'] }
          when 'safe_rest'
            input[:data][:health] = { current: data.health['max'], temp: data.health['temp'], max: data.health['max'] }
            input[:data][:wounds_spent] = [data.wounds_spent - 1, 0].max
            input[:data][:hit_die_spent] = 0
          end
        end

        def do_persist(input)
          update_refresh(input)

          character_update.call(input[:data].compact_blank.merge({ character: input[:character] }))

          { result: input[:character], recovery: input[:recovery] }
        end

        def update_refresh(input)
          input[:character].feats.where(limit_refresh: limit_refresh(input)).update_all(used_count: 0)
        end

        def limit_refresh(input)
          case input[:value]
          when 'combat_rest' then 0
          else []
          end
        end
      end
    end
  end
end
