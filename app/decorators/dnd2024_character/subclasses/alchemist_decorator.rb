# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class AlchemistDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['healing_word'] = static_spell_attributes
            result['ray_of_sickness'] = static_spell_attributes
          end
          if class_level >= 5
            result['flaming_sphere'] = static_spell_attributes
            result['melf_acid_arrow'] = static_spell_attributes
          end
          if class_level >= 9
            result['gaseous_form'] = static_spell_attributes
            result['mass_healing_word'] = static_spell_attributes
          end
          if class_level >= 13
            result['death_ward'] = static_spell_attributes
            result['vitriolic_sphere'] = static_spell_attributes
          end
          if class_level >= 17
            result['cloudkill'] = static_spell_attributes
            result['raise_dead'] = static_spell_attributes
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
