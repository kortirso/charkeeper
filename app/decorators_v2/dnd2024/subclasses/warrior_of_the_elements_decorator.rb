# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class WarriorOfTheElementsDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells
        @result['static_spells']['elementalism'] = static_spell_attributes if class_level >= 3
      end

      def class_level
        classes['monk']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
