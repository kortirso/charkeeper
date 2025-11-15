# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class PsiWarriorDecorator < ApplicationDecorator
      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          result['telekinesis'] = static_spell_attributes if class_level >= 18
          result
        end
      end

      private

      def class_level
        classes['fighter']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['int'], 'save_dc' => 8 + proficiency_bonus + modifiers['int'] }
      end
    end
  end
end
