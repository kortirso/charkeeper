# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class GreatOldOnePatronDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['detect_thoughts'] = static_spell_attributes
          @result['static_spells']['dissonant_whispers'] = static_spell_attributes
          @result['static_spells']['phantasmal_force'] = static_spell_attributes
          @result['static_spells']['tasha_hideous_laughter'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['clairvoyance'] = static_spell_attributes
          @result['static_spells']['hunger_of_hadar'] = static_spell_attributes
        end
        if class_level >= 7
          @result['static_spells']['confusion'] = static_spell_attributes
          @result['static_spells']['summon_aberration'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['modify_memory'] = static_spell_attributes
          @result['static_spells']['telekinesis'] = static_spell_attributes
        end
        @result['static_spells']['hex'] = static_spell_attributes if class_level >= 10
      end

      def class_level
        classes['warlock']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
