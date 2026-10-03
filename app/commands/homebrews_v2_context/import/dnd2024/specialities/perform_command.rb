# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Specialities
        class PerformCommand < BaseCommand
          # rubocop: disable-next Metrics/BlockLength
          use_contract do
            HitDices = Dry::Types['strict.integer'].enum(6, 8, 10, 12)
            Weapons = Dry::Types['strict.string'].enum('light', 'martial')
            Armors = Dry::Types['strict.string'].enum('light', 'medium', 'heavy', 'shield')
            Abilities = Dry::Types['strict.string'].enum('str', 'dex', 'con', 'int', 'wis', 'cha')
            Skills = Dry::Types['strict.string'].enum(*::Dnd2024::Character.skills.keys)

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
              optional(:public).filled(:bool)
              optional(:features).maybe(:array).each(:hash)
              required(:hit_dice).filled(HitDices)
              optional(:weapon_core_skills).maybe(:array).each(Weapons)
              optional(:armor_proficiency).maybe(:array).each(Armors)
              optional(:skill_boosts).filled(:integer, gteq?: 0)
              optional(:any_skill_boosts).filled(:integer, gteq?: 0)
              optional(:skill_boosts_list).maybe(:array).each(Skills)
              required(:class_saves).maybe(:array).each(Abilities)
              required(:multiclass_spell_level).filled(:integer, gteq?: 0, lteq?: 3)
              optional(:spell_ability).filled(Abilities)
              optional(:cantrips).hash
              optional(:prepared_spells).hash
              optional(:spell_slots).hash
              optional(:learn_spells).filled(:bool)
              optional(:spells).maybe(:array, max_size?: 100)
            end
          end

          private

          def validate_content(input) # rubocop: disable Metrics/AbcSize
            if input.key?(:id)
              input[:speciality] = ::Dnd2024::Homebrews::Speciality.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:speciality]
            end

            input[:features] = input[:features]&.map!(&:deep_symbolize_keys)
            input[:features]&.each do |feature|
              feature[:user] = input[:user]
              feature[:origin] = 'class'
              feature[:origin_value] = 'speciality.id'

              validate_result = add_feat.validate_all(feature)
              return validate_result[:raw_errors] if validate_result[:raw_errors]
            end

            nil
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(
              :hit_dice, :weapon_core_skills, :armor_proficiency, :skill_boosts, :any_skill_boosts, :skill_boosts_list,
              :class_saves, :multiclass_spell_level, :spell_ability, :cantrips, :prepared_spells, :spell_slots, :learn_spells,
              :spells
            )
          end

          def do_persist(input)
            command =
              if input[:speciality]
                HomebrewsV2Context::Import::Dnd2024::Specialities::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Dnd2024::Specialities::AddCommand.new
              end
            command.call(input)
          end

          def add_feat = HomebrewsV2Context::Import::Dnd2024::Feats::AddCommand.new
        end
      end
    end
  end
end
