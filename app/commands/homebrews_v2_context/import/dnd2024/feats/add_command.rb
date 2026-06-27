# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Feats
        class AddCommand < BaseCommand
          # rubocop: disable Metrics/BlockLength
          use_contract do
            Origins = Dry::Types['strict.string'].enum('feat')
            Kinds = Dry::Types['strict.string'].enum('static', 'text', 'update_result', 'hidden')
            Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'one_at_short_rest')

            params do
              required(:user).filled(type?: ::User)
              required(:title).hash do
                required(:en).filled(:string, max_size?: 50)
                optional(:ru).maybe(:string, max_size?: 50)
                optional(:es).maybe(:string, max_size?: 50)
              end
              required(:description).hash do
                required(:en).filled(:string, max_size?: 1_000)
                optional(:ru).maybe(:string, max_size?: 1_000)
                optional(:es).maybe(:string, max_size?: 1_000)
              end
              required(:origin).filled(Origins)
              required(:origin_value).filled(:string) # origin/general/fighting_style/epic classes subclasses
              required(:kind).filled(Kinds)
              required(:level).filled(:integer, gteq?: 1)
              optional(:limit).filled(:integer, gteq?: 1)
              optional(:limit_refresh).filled(Limits)
              optional(:modifiers).hash
              optional(:continious).filled(:bool)
              optional(:static_spells).hash
              optional(:ability_conditions).maybe(:array).each(:string) # требуемые характеристики, Сил 13+
              optional(:leveling_ability_boosts).maybe(:array).each(:string) # характеристики, которые могут быть повышены
            end

            rule(:limit, :limit_refresh).validate(:check_all_or_nothing_present)
          end
          # rubocop: enable Metrics/BlockLength

          private

          def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
            input[:slug] = SecureRandom.uuid
            input[:info] = {}

            if input.key?(:static_spells)
              static_spells = input[:static_spells].each_with_object({}) do |(key, value), acc|
                spell = ::Dnd2024::Feat.where(origin: 6).find_by("title ->> 'en' = ? OR title ->> 'ru' = ?", key, key)
                next unless spell

                acc[spell.slug] = value
              end
              input[:info][:static_spells] = static_spells
            end

            input[:origin_value] = sanitize(input[:origin_value])
            input[:conditions] = { level: input[:level] }
            if input.key?(:ability_conditions) && input[:origin] == 'feat'
              input[:conditions][:ability] = input[:ability_conditions]
            end
            input[:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
            if input.key?(:leveling_ability_boosts) && input[:origin] == 'feat'
              input[:info][:rewrite] = { ability_boosts: input[:leveling_ability_boosts], leveling_ability_boosts: 1 }
            end
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
          end

          def do_persist(input)
            result =
              ::Dnd2024::Feat.create!(input.except(:limit, :level, :static_spells, :ability_conditions, :leveling_ability_boosts))

            { result: result }
          end
        end
      end
    end
  end
end
