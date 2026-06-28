# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Backgrounds
        class AddCommand < BaseCommand
          include Deps[cache: 'cache.dnd_names']

          use_contract do
            Abilities = Dry::Types['strict.string'].enum('str', 'dex', 'con', 'int', 'wis', 'cha')
            Skills = Dry::Types['strict.string'].enum(*::Dnd2024::Character.skills.keys)

            params do
              required(:user).filled(type?: ::User)
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
              required(:selected_feat).filled(:string)
              required(:selected_skills).filled(:array).each(Skills)
              required(:ability_boosts).filled(:array).each(Abilities)
              optional(:public).filled(:bool)
            end
          end

          private

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = {
              selected_feats: feats(input)&.id,
              selected_skills: input[:selected_skills].index_with(1),
              ability_boosts: input[:ability_boosts]
            }
          end

          def do_persist(input)
            result = ::Dnd2024::Homebrews::Background.create!(input.except(:selected_feat, :selected_skills, :ability_boosts))

            cache.push_item(key: :backgrounds, item: result)

            { result: result }
          end

          def feats(input)
            ::Dnd2024::Feat.find_by(
              "title ->> 'en' = ? OR title ->> 'ru' = ?", input[:selected_feat], input[:selected_feat]
            ) || ::Dnd2024::Feat.find_by(id: input[:selected_feat])
          end
        end
      end
    end
  end
end
