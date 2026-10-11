# frozen_string_literal: true

# rubocop:disable all
module Pathfinder2Context
  module LevelProgressions
    class Custom < Pathfinder2Context::LevelProgression
      def call(character:)
        super

        record = Pathfinder2::Homebrews::Speciality.find_by(id: @character.data.main_class)
        return @result unless record

        info = record.info.attributes.symbolize_keys

        @result[:saving_throws] = character.data.saving_throws.merge(transform_deep_values(info[:saving_throws]), &merge_resolver)
        @result[:weapon_skills] = character.data.weapon_skills.merge(transform_deep_values(info[:weapon_skills]), &merge_resolver)
        @result[:armor_skills] = character.data.armor_skills.merge(transform_deep_values(info[:armor_skills]), &merge_resolver)

        @result[:perception] = [character.data.perception, transform_values(info[:perception])].max
        @result[:class_dc] = [character.data.class_dc, transform_values(info[:class_dc])].max
        @result[:spell_dc] = [character.data.spell_dc, transform_values(info[:spell_dc])].max
        @result[:spell_attack] = [character.data.spell_attack, transform_values(info[:spell_attack])].max

        @result
      end

      private

      def transform_deep_values(values)
        values.transform_values { |items| transform_values(items) }
      end

      def transform_values(values)
        values[values.keys.map(&:to_i).select { |item| item <= level }.max.to_s]
      end
    end
  end
end
