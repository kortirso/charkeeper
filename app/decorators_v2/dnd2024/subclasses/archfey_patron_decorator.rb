# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class ArchfeyPatronDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['calm_emotions'] = static_spell_attributes
          @result['static_spells']['faerie_fire'] = static_spell_attributes
          @result['static_spells']['misty_step'] = static_spell_attributes
          @result['static_spells']['phantasmal_force'] = static_spell_attributes
          @result['static_spells']['sleep'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['blink'] = static_spell_attributes
          @result['static_spells']['plant_growth'] = static_spell_attributes
        end
        if class_level >= 7
          @result['static_spells']['dominate_beast'] = static_spell_attributes
          @result['static_spells']['greater_invisibility'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['dominate_person'] = static_spell_attributes
          @result['static_spells']['seeming'] = static_spell_attributes
        end
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
