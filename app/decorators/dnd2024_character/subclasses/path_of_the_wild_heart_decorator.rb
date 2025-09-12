# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class PathOfTheWildHeartDecorator < ApplicationDecorator
      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['beast_sense'] = static_spell_attributes
            result['speak_with_animals'] = static_spell_attributes
          end
          result['commune_with_nature'] = static_spell_attributes if class_level >= 10
          result
        end
      end

      private

      def class_level
        classes['barbarian']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
