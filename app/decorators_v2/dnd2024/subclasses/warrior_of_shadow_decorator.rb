# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class WarriorOfShadowDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells
        return if class_level < 3

        @result['static_spells']['darkness'] = static_spell_attributes
        @result['static_spells']['minor_illusion'] = static_spell_attributes
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
