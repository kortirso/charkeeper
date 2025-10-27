# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class OathOfTheStarsDecorator < ApplicationDecorator
      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['guidance'] = static_spell_attributes
            result['guiding_bolt'] = static_spell_attributes.merge({ 'limit' => [modifiers['wis'], 1].max })
          end
          result
        end
      end

      private

      def class_level
        classes['druid']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
