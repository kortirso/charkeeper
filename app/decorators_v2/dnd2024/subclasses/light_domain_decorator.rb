# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class LightDomainDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['burning_hands'] = static_spell_attributes
          @result['static_spells']['faerie_fire'] = static_spell_attributes
          @result['static_spells']['scorching_ray'] = static_spell_attributes
          @result['static_spells']['see_invisibility'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['daylight'] = static_spell_attributes
          @result['static_spells']['fireball'] = static_spell_attributes
        end
        if class_level >= 7
          @result['static_spells']['arcane_eye'] = static_spell_attributes
          @result['static_spells']['wall_of_fire'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['flame_strike'] = static_spell_attributes
          @result['static_spells']['scrying'] = static_spell_attributes
        end
      end

      def class_level
        classes['cleric']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
