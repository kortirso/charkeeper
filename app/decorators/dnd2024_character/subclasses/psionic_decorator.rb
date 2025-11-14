# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class PsionicDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['arms_of_hadar'] = static_spell_attributes
            result['calm_emotions'] = static_spell_attributes
            result['detect_thoughts'] = static_spell_attributes
            result['dissonant_whispers'] = static_spell_attributes
            result['mind_sliver'] = static_spell_attributes
          end
          if class_level >= 5
            result['hunger_of_hadar'] = static_spell_attributes
            result['sending'] = static_spell_attributes
          end
          if class_level >= 7
            result['evard_black_tentacles'] = static_spell_attributes
            result['summon_aberration'] = static_spell_attributes
          end
          if class_level >= 9
            result['rary_telepathic_bond'] = static_spell_attributes
            result['telekinesis'] = static_spell_attributes
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
