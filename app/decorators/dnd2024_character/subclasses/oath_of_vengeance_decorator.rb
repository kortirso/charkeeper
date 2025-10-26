# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class OathOfVengeanceDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['bane'] = static_spell_attributes
            result['hunter_mark'] = static_spell_attributes
          end
          if class_level >= 5
            result['hold_person'] = static_spell_attributes
            result['misty_step'] = static_spell_attributes
          end
          if class_level >= 9
            result['haste'] = static_spell_attributes
            result['protection_from_energy'] = static_spell_attributes
          end
          if class_level >= 13
            result['banishment'] = static_spell_attributes
            result['dimension_door'] = static_spell_attributes
          end
          if class_level >= 17
            result['hold_monster'] = static_spell_attributes
            result['scrying'] = static_spell_attributes
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
