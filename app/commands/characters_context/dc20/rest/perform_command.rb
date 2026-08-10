# frozen_string_literal: true

module CharactersContext
  module Dc20
    module Rest
      class PerformCommand < BaseCommand
        include Deps[
          update_wild_form: 'commands.characters_context.dc20.wild_forms.update'
        ]

        NO_FEAT_REFRESH = %w[quick].freeze
        RESTORE_REST_POINTS = %w[half_long complete_long full].freeze
        RESTORE_WILD_FORMS = %w[complete_long full].freeze

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

        def lock_key(input) = "character_update_#{input[:character].id}"
        def lock_time = 0

        def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity
          return if input[:options].nil?
          return if input[:value] == 'combat'

          if RESTORE_WILD_FORMS.include?(input[:value])
            input[:character].children.each do |wild_form|
              health = wild_form.data.health
              update_wild_form.call(
                wild_form: wild_form, health: wild_form.data.health.merge(
                  'current' => health['max'] || 3, 'temp' => health['temp'], 'max' => health['max']
                )
              )
            end
          end

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
          return if input[:value] != 'short' && input[:value] != 'half_long'

          input[:character].feats
            .where(limit_refresh: 3)
            .where.not(used_count: 0)
            .find_each { |item| item.decrement!(:used_count) }
        end

        def limit_refresh(input)
          case input[:value]
          when 'combat' then 2
          when 'short', 'half_long' then [0, 2]
          when 'complete_long', 'full' then [0, 1, 2, 3]
          else []
          end
        end
      end
    end
  end
end
