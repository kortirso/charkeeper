# frozen_string_literal: true

module CharactersContext
  module Dc20
    module Rest
      class PerformCommand < BaseCommand
        NO_FEAT_REFRESH = %w[quick].freeze
        RESTORE_REST_POINTS = %w[half_long complete_long full].freeze

        use_contract do
          config.messages.namespace = :dc20_rest

          Rests = Dry::Types['strict.string'].enum('combat', 'quick', 'short', 'half_long', 'complete_long', 'full')

          params do
            required(:character).filled(type?: ::Dc20::Character)
            required(:value).filled(Rests)
            optional(:options).hash do
              required(:spend_rest_points).filled(:integer, gteq?: 0)
              required(:max_health).filled(:integer, gteq?: 0)
            end
          end
        end

        private

        def do_prepare(input) # rubocop: disable Metrics/AbcSize
          return if input[:options].nil?
          return if input[:value] == 'combat'

          data = input[:character].data
          spend_rest_points =
            input[:value].in?(RESTORE_REST_POINTS) ? data.rest_points['current'] : input.dig(:options, :spend_rest_points)

          input[:data] = {}
          input[:data][:health] =
            data.health.merge({ 'current' => [data.health['current'] + spend_rest_points, input.dig(:options, :max_health)].min })
          input[:data][:rest_points] =
            if input[:value].in?(RESTORE_REST_POINTS)
              data.rest_points.merge({ 'current' => input.dig(:options, :max_health) })
            else
              data.rest_points.merge({ 'current' => data.rest_points['current'] - spend_rest_points })
            end
        end

        def do_persist(input)
          update_refresh(input)

          if input[:data]
            input[:character].data = ::Dc20::CharacterData.new(input[:character].data.attributes.merge(input[:data]))
            input[:character].save
          end

          { result: input[:character] }
        end

        def update_refresh(input)
          return if input[:value].in?(NO_FEAT_REFRESH)

          input[:character].feats.where(limit_refresh: limit_refresh(input)).update_all(used_count: 0)
        end

        def limit_refresh(input)
          case input[:value]
          when 'combat' then 2
          when 'short', 'half_long' then [0, 2]
          when 'complete_long', 'full' then [0, 1, 2]
          else []
          end
        end
      end
    end
  end
end
