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
              required(:feat).filled(:string)
              required(:skill_boosts).filled(Skills)
              required(:ability_boosts).filled(:array, size?: 2).each(Abilities)
              required(:lore_name).filled(:string)
              optional(:public).filled(:bool)
            end
          end

          private

          def validate_content(input)
            if input.key?(:id)
              input[:background] = ::Pathfinder2::Homebrews::Background.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:background]
            end

            nil
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = {
              feat: feat(input)&.id,
              skill_boosts: input[:skill_boosts],
              ability_boosts: input[:ability_boosts].join('_'),
              lore_name: input[:lore_name]
            }
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
            ::Pathfinder2::Feat.find_by(
              "title ->> 'en' = ? OR title ->> 'ru' = ?", input[:feat], input[:feat]
            ) || ::Pathfinder2::Feat.find_by(id: input[:feat])
          end
        end
      end
    end
  end
end
