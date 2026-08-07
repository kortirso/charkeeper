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
        TOKEN_LIMITS = %w[level str dex int wil].freeze

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

        def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
          input[:data] = { health: {} }
          input[:decorator] = input[:character].decorator(skip: %i[features attacks skills])
          return if input[:value] == 'combat_rest'

          data = input[:character].data

          case input[:value]
          when 'field_rest'
            if input[:make_rolls]
              input[:recovery] = roll.call(dice: "#{input[:hit_die_spend]}d#{input[:hit_die]}")
              input[:recovery] += input[:decorator].modified_abilities['str'] * input[:hit_die_spend]
            end
            input[:data][:hit_die_spent] = data.hit_die_spent + input[:hit_die_spend]

            current = [data.health['current'] + input[:recovery].to_i, data.health['max']].min
            input[:data][:health] = { current: current, temp: data.health['temp'], max: data.health['max'] }
          when 'long_field_rest'
            if input[:make_rolls]
              input[:recovery] = input[:hit_die_spend] * input[:hit_die]
              input[:recovery] += input[:decorator].modified_abilities['str'] * input[:hit_die_spend]
            end
            input[:data][:hit_die_spent] = data.hit_die_spent + input[:hit_die_spend]

            current = [data.health['current'] + input[:recovery].to_i, data.health['max']].min
            input[:data][:health] = { current: current, temp: data.health['temp'], max: data.health['max'] }
          when 'safe_rest'
            input[:data][:health] = { current: data.health['max'], temp: data.health['temp'], max: data.health['max'] }
            input[:data][:wounds_spent] = [data.wounds_spent - 1, 0].max
            input[:data][:mana_spent] = 0
            input[:data][:hit_die_spent] = 0
          end
        end

        def do_persist(input)
          refresh_feats(input)
          refresh_feats_tokens(input)

          character_update.call(input[:data].compact_blank.merge({ character: input[:character] }))

          { result: input[:character], recovery: input[:recovery] }
        end

        def refresh_feats(input)
          input[:character].feats.where(limit_refresh: limit_refresh(input)).update_all(used_count: 0)
        end

        def limit_refresh(input)
          case input[:value]
          when 'combat_rest' then 0
          else []
          end
        end

        def refresh_feats_tokens(input)
          input[:character].feats.where.not(tokens: nil).includes(:feat).find_each do |feature|
            settings = feature.feat.tokens
            next unless settings['reset_at']
            next if tokens_refresh(input).exclude?(settings['reset_at'])

            feature.update(tokens: [find_future_tokens(feature, input, settings), 0].max)
          end
        end

        def find_future_tokens(feature, input, settings)
          if input[:value] == 'safe_rest' && settings['reset_at_long']
            settings['reset'] = settings['reset_at_long']
          end

          case settings['reset']
          when 'zero' then 0
          when 'limit' then find_dynamic_value(input[:decorator], settings['limit'])
          when *TOKEN_LIMITS then add_tokens(feature, input[:decorator], settings)
          else feature.tokens + settings['reset'].to_i
          end
        end

        def add_tokens(feature, decorator, settings)
          [
            feature.tokens + find_dynamic_value(decorator, settings['reset']),
            find_dynamic_value(decorator, settings['limit'])
          ].min
        end

        def find_dynamic_value(decorator, limit)
          return 1_000 if limit == 'none'
          return decorator.level if limit == 'level'

          decorator.modified_abilities[limit]
        end

        def tokens_refresh(input)
          case input[:value]
          when 'safe_rest' then %w[combat_rest field_rest long_field_rest safe_rest]
          when 'long_field_rest' then %w[combat_rest field_rest long_field_rest]
          when 'field_rest' then %w[combat_rest field_rest]
          else [input[:value]]
          end
        end
      end
    end
  end
end
