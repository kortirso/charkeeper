# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class BattleSmithDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['heroism'] = static_spell_attributes
            result['shield'] = static_spell_attributes
          end
          if class_level >= 5
            result['shining_smite'] = static_spell_attributes
            result['warding_bond'] = static_spell_attributes
          end
          if class_level >= 9
            result['aura_of_vitality'] = static_spell_attributes
            result['conjure_barrage'] = static_spell_attributes
          end
          if class_level >= 13
            result['aura_of_purity'] = static_spell_attributes
            result['fire_shield'] = static_spell_attributes
          end
          if class_level >= 17
            result['banishing_smite'] = static_spell_attributes
            result['mass_cure_wounds'] = static_spell_attributes
          end
          result
        end
      end

      private

      def class_level
        classes['artificer']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['int'], 'save_dc' => 8 + proficiency_bonus + modifiers['int'] }
      end
    end
  end
end
