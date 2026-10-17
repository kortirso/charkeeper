# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Specialities
        class PerformCommand < BaseCommand
          use_contract do
            Abilities = Dry::Types['strict.string'].enum('str', 'dex', 'con', 'int', 'wis', 'cha')
            SpellAmounts = Dry::Types['strict.string'].enum('none', 'wizard', 'bard')

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
              optional(:features).maybe(:array).each(:hash)
              optional(:spells_available).filled(:bool)
              optional(:only_focus_spells).filled(:bool)
              optional(:spells_amount).filled(SpellAmounts)
              optional(:cantrips_amount).maybe(:integer)
              optional(:cantrip_slots).maybe(:integer)
              optional(:additional_slots).filled(:integer)
              optional(:subclass_title).hash
            end
          end

          private

          def validate_content(input) # rubocop: disable Metrics/AbcSize
            if input.key?(:id)
              input[:speciality] = ::Pathfinder2::Homebrews::Speciality.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:speciality]
            end

            input[:features] = input[:features]&.map!(&:deep_symbolize_keys)
            input[:features]&.each do |feature|
              feature[:user] = input[:user]
              feature[:origin_value] = 'class.id'

              validate_result = add_feat_command.validate_all(feature)
              return validate_result[:raw_errors] if validate_result[:raw_errors]
            end

            nil
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description]&.transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(
              :class_hp, :main_abilities, :skill_boosts, :perception, :class_dc, :spell_dc, :spell_attack, :spell_list,
              :saving_throws, :weapon_skills, :armor_skills, :feats, :spells_available, :only_focus_spells, :spells_amount,
              :cantrips_amount, :cantrip_slots, :additional_slots, :subclass_title
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

          def add_feat_command = Charkeeper::Container.resolve('commands.homebrews_v2_context.import.pathfinder2.feats.add')
        end
      end
    end
  end
end
