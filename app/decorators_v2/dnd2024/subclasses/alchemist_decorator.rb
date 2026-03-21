# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class AlchemistDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['healing_word'] = static_spell_attributes
          @result['static_spells']['ray_of_sickness'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['flaming_sphere'] = static_spell_attributes
          @result['static_spells']['melf_acid_arrow'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['gaseous_form'] = static_spell_attributes
          @result['static_spells']['mass_healing_word'] = static_spell_attributes
        end
        if class_level >= 13
          @result['static_spells']['death_ward'] = static_spell_attributes
          @result['static_spells']['vitriolic_sphere'] = static_spell_attributes
        end
        if class_level >= 17
          @result['static_spells']['cloudkill'] = static_spell_attributes
          @result['static_spells']['raise_dead'] = static_spell_attributes
        end
      end

      def class_level
        classes['artificer']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['int'], 'save_dc' => 8 + proficiency_bonus + modifiers['int'] }
      end
    end
  end
end
