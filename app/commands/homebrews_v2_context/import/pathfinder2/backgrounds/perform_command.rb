# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Backgrounds
        class PerformCommand < BaseCommand
          use_contract do
            Abilities = Dry::Types['strict.string'].enum('str', 'dex', 'con', 'int', 'wis', 'cha')
            Skills = Dry::Types['strict.string'].enum(*(::Pathfinder2::Character.skills.keys + ['free']))

            params do
              required(:user).filled(type?: ::User)
              optional(:id).filled(:string, :uuid_v4?)
              required(:title).hash do
                required(:en).filled(:string, max_size?: 50)
                optional(:ru).maybe(:string, max_size?: 50)
                optional(:es).maybe(:string, max_size?: 50)
              end
              optional(:description).hash do
                required(:en).filled(:string, max_size?: 500)
                optional(:ru).maybe(:string, max_size?: 500)
                optional(:es).maybe(:string, max_size?: 500)
              end
              optional(:feat).filled(:string)
              optional(:public).filled(:bool)
              optional(:ability_boosts).filled(:array).each(Abilities)
              optional(:ability_free_boosts).filled(:integer)
              optional(:skill_boosts).filled(:array).each(:string)
              optional(:lore_names).filled(:array).each(:string)
              optional(:features).maybe(:array).each(:hash)
            end
          end

          private

          def validate_content(input) # rubocop: disable Metrics/AbcSize
            if input.key?(:id)
              input[:background] = ::Pathfinder2::Homebrews::Background.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:background]
            end

            input[:features] = input[:features]&.map!(&:deep_symbolize_keys)
            input[:features]&.each do |feature|
              feature[:user] = input[:user]
              feature[:origin] = 'static_background'
              feature[:origin_value] = 'background.id'

              validate_result = add_feat.validate_all(feature)
              return validate_result[:raw_errors] if validate_result[:raw_errors]
            end

            nil
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(:skill_boosts, :ability_boosts, :lore_names, :ability_free_boosts).merge({
              feat: feat(input)&.id
            }).compact
          end

          def do_persist(input)
            command =
              if input[:background]
                HomebrewsV2Context::Import::Pathfinder2::Backgrounds::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Pathfinder2::Backgrounds::AddCommand.new
              end
            command.call(input)
          end

          def feat(input)
            return if input[:feat].blank?

            ::Pathfinder2::Feat.find_by(
              "title ->> 'en' = ? OR title ->> 'ru' = ?", input[:feat], input[:feat]
            ) || ::Pathfinder2::Feat.find_by(id: input[:feat])
          end

          def add_feat = HomebrewsV2Context::Import::Pathfinder2::Feats::AddCommand.new
        end
      end
    end
  end
end
