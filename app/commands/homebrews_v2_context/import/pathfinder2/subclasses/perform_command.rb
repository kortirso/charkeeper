# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Subclasses
        class PerformCommand < BaseCommand
          use_contract do
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
              required(:class_id).filled(:string)
              optional(:public).filled(:bool)
              optional(:features).maybe(:array).each(:hash)
              optional(:skill_boosts).hash
              optional(:spell_list).filled(:string)
              optional(:spells).maybe(:array).each(:string)
              optional(:focus_spells).maybe(:array).each(:string)
              optional(:feats).maybe(:array).each(:string)
            end
          end

          private

          def validate_content(input) # rubocop: disable Metrics/AbcSize
            if input.key?(:id)
              input[:subclass] = ::Pathfinder2::Homebrews::Subclass.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:subclass]
            end

            input[:features] = input[:features]&.map!(&:deep_symbolize_keys)
            input[:features]&.each do |feature|
              feature[:user] = input[:user]
              feature[:origin_value] = 'subclass.id'

              validate_result = add_feat.validate_all(feature)
              return validate_result[:raw_errors] if validate_result[:raw_errors]
            end

            nil
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(
              :skill_boosts, :spell_list, :spells, :focus_spells, :feats
            ).merge({ class_id: sanitize(input[:class_id]) })
          end

          def do_persist(input)
            command =
              if input[:subclass]
                HomebrewsV2Context::Import::Pathfinder2::Subclasses::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Pathfinder2::Subclasses::AddCommand.new
              end
            command.call(input)
          end

          def add_feat = HomebrewsV2Context::Import::Pathfinder2::Feats::AddCommand.new
        end
      end
    end
  end
end
