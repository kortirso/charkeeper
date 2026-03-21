# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class ClockworkSorceryDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['aid'] = static_spell_attributes
          @result['static_spells']['alarm'] = static_spell_attributes
          @result['static_spells']['lesser_restoration'] = static_spell_attributes
          @result['static_spells']['protection_from_evil_and_good'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['dispel_magic'] = static_spell_attributes
          @result['static_spells']['protection_from_energy'] = static_spell_attributes
        end
        if class_level >= 7
          @result['static_spells']['freedom_of_movement'] = static_spell_attributes
          @result['static_spells']['summon_construct'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['greater_restoration'] = static_spell_attributes
          @result['static_spells']['wall_of_force'] = static_spell_attributes
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
