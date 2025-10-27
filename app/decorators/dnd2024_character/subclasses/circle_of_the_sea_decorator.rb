# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class CircleOfTheSeaDecorator < ApplicationDecorator
      SPELLS = {
        3 => %w[fog_cloud gust_of_wind ray_of_frost shatter thunderwave],
        5 => %w[lightning_bolt water_breathing],
        7 => %w[control_water ice_storm],
        9 => %w[conjure_elemental hold_monster]
      }.freeze

      def static_spells # rubocop: disable Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          result.merge!(SPELLS[class_level].index_with { static_spell_attributes }) if class_level >= 3
          result.merge!(SPELLS[class_level].index_with { static_spell_attributes }) if class_level >= 5
          result.merge!(SPELLS[class_level].index_with { static_spell_attributes }) if class_level >= 7
          result.merge!(SPELLS[class_level].index_with { static_spell_attributes }) if class_level >= 9
          result
        end
      end

      private

      def class_level
        classes['druid']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
