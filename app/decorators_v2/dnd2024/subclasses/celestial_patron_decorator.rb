# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class CelestialPatronDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['aid'] = static_spell_attributes
          @result['static_spells']['cure_wounds'] = static_spell_attributes
          @result['static_spells']['guiding_bolt'] = static_spell_attributes
          @result['static_spells']['lesser_restoration'] = static_spell_attributes
          @result['static_spells']['light'] = static_spell_attributes
          @result['static_spells']['sacred_flame'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['daylight'] = static_spell_attributes
          @result['static_spells']['revivify'] = static_spell_attributes
        end
        if class_level >= 7
          @result['static_spells']['guardian_of_faith'] = static_spell_attributes
          @result['static_spells']['wall_of_fire'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['greater_restoration'] = static_spell_attributes
          @result['static_spells']['summon_celestial'] = static_spell_attributes
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
