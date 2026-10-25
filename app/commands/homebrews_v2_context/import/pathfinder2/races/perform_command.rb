# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Races
        class PerformCommand < BaseCommand
          ABILITIES = %i[str dex con int wis cha].freeze

          # rubocop: disable-next Metrics/BlockLength
          use_contract do
            Visions = Dry::Types['strict.string'].enum('low-light', 'dark')

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
              required(:speed).filled(:integer)
              required(:health).filled(:integer)
              required(:languages).maybe(:array).each(:string)
              required(:abilities).hash do
                optional(:str).filled(:integer, gteq?: -2, lteq?: 4)
                optional(:dex).filled(:integer, gteq?: -2, lteq?: 4)
                optional(:con).filled(:integer, gteq?: -2, lteq?: 4)
                optional(:int).filled(:integer, gteq?: -2, lteq?: 4)
                optional(:wis).filled(:integer, gteq?: -2, lteq?: 4)
                optional(:cha).filled(:integer, gteq?: -2, lteq?: 4)
              end
              optional(:ability_boosts).maybe(:array).each(:string)
              optional(:vision).filled(Visions)
              optional(:public).filled(:bool)
              optional(:features).maybe(:array).each(:hash)
            end
          end

          private

          def validate_content(input) # rubocop: disable Metrics/AbcSize
            if input.key?(:id)
              input[:race] = ::Pathfinder2::Homebrews::Race.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:race]
            end

            input[:features] = input[:features]&.map!(&:deep_symbolize_keys)
            input[:features]&.each do |feature|
              feature[:user] = input[:user]
              feature[:origin_value] = 'race.id'

              validate_result = add_feat.validate_all(feature)
              return validate_result[:raw_errors] if validate_result[:raw_errors]
            end

            nil
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:ability_boosts] = find_free_ability_boosts(input)
            input[:info] = input.slice(:speed, :health, :languages, :abilities, :ability_boosts, :vision)
          end

          def do_persist(input)
            command =
              if input[:race]
                HomebrewsV2Context::Import::Pathfinder2::Races::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Pathfinder2::Races::AddCommand.new
              end
            command.call(input)
          end

          def add_feat = HomebrewsV2Context::Import::Pathfinder2::Feats::AddCommand.new

          def find_free_ability_boosts(input)
            [(ABILITIES - input[:abilities].except(:free).filter_map { |k, v| v.positive? ? k : nil }).join('_')] +
              (input[:ability_boosts] || [])
          end
        end
      end
    end
  end
end
