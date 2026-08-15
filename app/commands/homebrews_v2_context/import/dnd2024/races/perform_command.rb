# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Races
        class PerformCommand < BaseCommand
          # rubocop: disable Metrics/BlockLength
          use_contract do
            DamageTypes = Dry::Types['strict.string'].enum(
              'bludge', 'pierce', 'slash', 'acid', 'cold', 'fire', 'force', 'lighting', 'necrotic', 'poison', 'psychic',
              'radiant', 'thunder'
            )
            Sizes = Dry::Types['strict.string'].enum('small', 'medium', 'large')

            params do
              required(:user).filled(type?: ::User)
              optional(:id).filled(:string, :uuid_v4?)
              required(:title).hash do
                required(:en).filled(:string, max_size?: 50)
                optional(:ru).maybe(:string, max_size?: 50)
                optional(:es).maybe(:string, max_size?: 50)
              end
              required(:description).hash do
                required(:en).filled(:string, max_size?: 500)
                optional(:ru).maybe(:string, max_size?: 500)
                optional(:es).maybe(:string, max_size?: 500)
              end
              optional(:resistance).maybe(:array).each(DamageTypes)
              optional(:immunity).maybe(:array).each(DamageTypes)
              optional(:vulnerability).maybe(:array).each(DamageTypes)
              optional(:size).maybe(:array).each(Sizes)
              optional(:vision).hash do
                optional(:darkvision).maybe(:integer, gteq?: 1, lteq?: 1_000)
                optional(:truesight).maybe(:integer, gteq?: 1, lteq?: 1_000)
                optional(:blindsight).maybe(:integer, gteq?: 1, lteq?: 1_000)
                optional(:tremorsense).maybe(:integer, gteq?: 1, lteq?: 1_000)
              end
              optional(:speed).maybe(:integer, gteq?: 1, lteq?: 100)
              optional(:speeds).hash do
                optional(:flight).maybe(:integer, gteq?: 0, lteq?: 1_000)
                optional(:swim).maybe(:integer, gteq?: 0, lteq?: 1_000)
                optional(:climb).maybe(:integer, gteq?: 0, lteq?: 1_000)
                optional(:burrow).maybe(:integer, gteq?: 0, lteq?: 1_000)
              end
              optional(:public).filled(:bool)
              optional(:features).maybe(:array).each(:hash)
            end
          end
          # rubocop: enable Metrics/BlockLength

          private

          def validate_content(input) # rubocop: disable Metrics/AbcSize
            if input.key?(:id)
              input[:race] = ::Dnd2024::Homebrews::Race.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:race]
            end

            input[:features] = input[:features]&.map!(&:deep_symbolize_keys)
            input[:features]&.each do |feature|
              feature[:user] = input[:user]
              feature[:origin] = 'species'
              feature[:origin_value] = 'species.id'

              validate_result = add_feat.validate_all(feature)
              return validate_result[:raw_errors] if validate_result[:raw_errors]
            end

            nil
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(:resistance, :immunity, :vulnerability, :size, :vision, :speed, :speeds)
          end

          def do_persist(input)
            command =
              if input[:race]
                HomebrewsV2Context::Import::Dnd2024::Races::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Dnd2024::Races::AddCommand.new
              end
            command.call(input)
          end

          def add_feat = HomebrewsV2Context::Import::Dnd2024::Feats::AddCommand.new
        end
      end
    end
  end
end
