# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Specialities
        class PerformCommand < BaseCommand
          use_contract do
            Abilities = Dry::Types['strict.string'].enum('str', 'dex', 'con', 'int', 'wis', 'cha')

            # rubocop: disable-next Metrics/BlockLength
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
              optional(:public).filled(:bool)
              required(:class_hp).filled(:integer)
              required(:main_abilities).filled(:array, min_size?: 1).each(Abilities)
              required(:skill_boosts).hash
              required(:perception).hash
              required(:class_dc).hash
              required(:spell_dc).hash
              required(:spell_attack).hash
              optional(:spell_list).maybe(:string)
              required(:saving_throws).hash
              required(:weapon_skills).hash
              required(:armor_skills).hash
              required(:feats).maybe(:array).each(:string)
            end
          end

          private

          def validate_content(input)
            if input.key?(:id)
              input[:speciality] = ::Pathfinder2::Homebrews::Speciality.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:speciality]
            end

            nil
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description]&.transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(
              :class_hp, :main_abilities, :skill_boosts, :perception, :class_dc, :spell_dc, :spell_attack, :spell_list,
              :saving_throws, :weapon_skills, :armor_skills, :feats
            )
          end

          def do_persist(input)
            command =
              if input[:speciality]
                HomebrewsV2Context::Import::Pathfinder2::Specialities::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Pathfinder2::Specialities::AddCommand.new
              end
            command.call(input)
          end
        end
      end
    end
  end
end
