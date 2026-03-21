# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class ArtilleristDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['shield'] = static_spell_attributes
          @result['static_spells']['thunderwave'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['scorching_ray'] = static_spell_attributes
          @result['static_spells']['shatter'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['fireball'] = static_spell_attributes
          @result['static_spells']['wind_wall'] = static_spell_attributes
        end
        if class_level >= 13
          @result['static_spells']['ice_storm'] = static_spell_attributes
          @result['static_spells']['wall_of_fire'] = static_spell_attributes
        end
        if class_level >= 17
          @result['static_spells']['cone_of_cold'] = static_spell_attributes
          @result['static_spells']['wall_of_force'] = static_spell_attributes
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
