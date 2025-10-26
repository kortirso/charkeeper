# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class OathOfGloryDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['guiding_bolt'] = static_spell_attributes
            result['heroism'] = static_spell_attributes
          end
          if class_level >= 5
            result['enhance_ability'] = static_spell_attributes
            result['magic_weapon'] = static_spell_attributes
          end
          if class_level >= 9
            result['haste'] = static_spell_attributes
            result['protection_from_energy'] = static_spell_attributes
          end
          if class_level >= 13
            result['compulsion'] = static_spell_attributes
            result['freedom_of_movement'] = static_spell_attributes
          end
          if class_level >= 17
            result['legend_lore'] = static_spell_attributes
            result['yolande_regal_presence'] = static_spell_attributes
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
