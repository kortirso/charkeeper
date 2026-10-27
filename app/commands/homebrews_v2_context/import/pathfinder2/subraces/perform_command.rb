# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Subraces
        class PerformCommand < BaseCommand
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
              optional(:race_id).maybe(:string)
              optional(:speed).filled(:integer)
              optional(:health).filled(:integer)
              optional(:skill_boosts).maybe(:array).each(:string)
              optional(:feats).maybe(:array).each(:string)
              optional(:vision).filled(Visions)
              optional(:public).filled(:bool)
              optional(:features).maybe(:array).each(:hash)
            end
          end

          private

          def validate_content(input) # rubocop: disable Metrics/AbcSize
            if input.key?(:id)
              input[:subrace] = ::Pathfinder2::Homebrews::Subrace.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:subrace]
            end

            input[:features] = input[:features]&.map!(&:deep_symbolize_keys)
            input[:features]&.each do |feature|
              feature[:user] = input[:user]
              feature[:origin_value] = 'subrace.id'

              validate_result = add_feat.validate_all(feature)
              return validate_result[:raw_errors] if validate_result[:raw_errors]
            end

            nil
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(:race_id, :speed, :health, :skill_boosts, :feats, :vision)
          end

          def do_persist(input)
            command =
              if input[:subrace]
                HomebrewsV2Context::Import::Pathfinder2::Subraces::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Pathfinder2::Subraces::AddCommand.new
              end
            command.call(input)
          end

          def add_feat = HomebrewsV2Context::Import::Pathfinder2::Feats::AddCommand.new
        end
      end
    end
  end
end
