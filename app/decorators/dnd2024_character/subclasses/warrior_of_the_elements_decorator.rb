# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class WarriorOfTheElementsDecorator < ApplicationDecorator
      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          result['elementalism'] = static_spell_attributes if class_level >= 3
          result
        end
      end

      private

      def class_level
        classes['monk']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
