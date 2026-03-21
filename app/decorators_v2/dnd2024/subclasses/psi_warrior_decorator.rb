# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class PsiWarriorDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells
        @result['static_spells']['telekinesis'] = static_spell_attributes if class_level >= 18
      end

      def class_level
        classes['fighter']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['int'], 'save_dc' => 8 + proficiency_bonus + modifiers['int'] }
      end
    end
  end
end
