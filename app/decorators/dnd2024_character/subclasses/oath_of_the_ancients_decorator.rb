# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class OathOfTheAncientsDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['ensnaring_strike'] = static_spell_attributes
            result['speak_with_animals'] = static_spell_attributes
          end
          if class_level >= 5
            result['misty_step'] = static_spell_attributes
            result['moonbeam'] = static_spell_attributes
          end
          if class_level >= 9
            result['plant_growth'] = static_spell_attributes
            result['protection_from_energy'] = static_spell_attributes
          end
          if class_level >= 13
            result['ice_storm'] = static_spell_attributes
            result['stoneskin'] = static_spell_attributes
          end
          if class_level >= 17
            result['commune_with_nature'] = static_spell_attributes
            result['tree_stride'] = static_spell_attributes
          end
          result
        end
      end

      private

      def class_level
        classes['paladin']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
