# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class CircleOfTheSeaDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['fog_cloud'] = static_spell_attributes
          @result['static_spells']['gust_of_wind'] = static_spell_attributes
          @result['static_spells']['ray_of_frost'] = static_spell_attributes
          @result['static_spells']['shatter'] = static_spell_attributes
          @result['static_spells']['thunderwave'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['lightning_bolt'] = static_spell_attributes
          @result['static_spells']['water_breathing'] = static_spell_attributes
        end
        if class_level >= 7
          @result['static_spells']['control_water'] = static_spell_attributes
          @result['static_spells']['ice_storm'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['conjure_elemental'] = static_spell_attributes
          @result['static_spells']['hold_monster'] = static_spell_attributes
        end
      end

      def class_level
        classes['druid']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
