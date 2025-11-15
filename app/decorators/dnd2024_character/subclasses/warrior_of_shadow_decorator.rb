# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class WarriorOfShadowDecorator < ApplicationDecorator
      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['darkness'] = static_spell_attributes
            result['minor_illusion'] = static_spell_attributes
          end
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
