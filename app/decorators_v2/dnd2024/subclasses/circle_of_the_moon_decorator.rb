# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class CircleOfTheMoonDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['cure_wounds'] = static_spell_attributes
          @result['static_spells']['moonbeam'] = static_spell_attributes
          @result['static_spells']['starry_wisp'] = static_spell_attributes
        end
        @result['static_spells']['conjure_animals'] = static_spell_attributes if class_level >= 5
        @result['static_spells']['fount_of_moonlight'] = static_spell_attributes if class_level >= 7
        @result['static_spells']['mass_cure_wounds'] = static_spell_attributes if class_level >= 9
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
