# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class DraconicDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['alter_self'] = static_spell_attributes
            result['chromatic_orb'] = static_spell_attributes
            result['command'] = static_spell_attributes
            result['dragon_breath'] = static_spell_attributes
          end
          if class_level >= 5
            result['fear'] = static_spell_attributes
            result['fly'] = static_spell_attributes
          end
          if class_level >= 7
            result['arcane_eye'] = static_spell_attributes
            result['charm_monster'] = static_spell_attributes
          end
          if class_level >= 9
            result['legend_lore'] = static_spell_attributes
            result['summon_dragon'] = static_spell_attributes
          end
          result
        end
      end

      private

      def class_level
        classes['sorcerer']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
