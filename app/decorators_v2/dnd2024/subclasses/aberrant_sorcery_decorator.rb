# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class AberrantSorceryDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['arms_of_hadar'] = static_spell_attributes
          @result['static_spells']['calm_emotions'] = static_spell_attributes
          @result['static_spells']['detect_thoughts'] = static_spell_attributes
          @result['static_spells']['dissonant_whispers'] = static_spell_attributes
          @result['static_spells']['mind_sliver'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['hunger_of_hadar'] = static_spell_attributes
          @result['static_spells']['sending'] = static_spell_attributes
        end
        if class_level >= 7
          @result['static_spells']['evard_black_tentacles'] = static_spell_attributes
          @result['static_spells']['summon_aberration'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['rary_telepathic_bond'] = static_spell_attributes
          @result['static_spells']['telekinesis'] = static_spell_attributes
        end
      end

      def class_level
        classes['sorcerer']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
