# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class ArmorerDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['magic_missile'] = static_spell_attributes
          @result['static_spells']['thunderwave'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['mirror_image'] = static_spell_attributes
          @result['static_spells']['shatter'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['hypnotic_pattern'] = static_spell_attributes
          @result['static_spells']['lightning_bolt'] = static_spell_attributes
        end
        if class_level >= 13
          @result['static_spells']['fire_shield'] = static_spell_attributes
          @result['static_spells']['greater_invisibility'] = static_spell_attributes
        end
        if class_level >= 17
          @result['static_spells']['passwall'] = static_spell_attributes
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
