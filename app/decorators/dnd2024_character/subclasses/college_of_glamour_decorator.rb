# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class CollegeOfGlamourDecorator < ApplicationDecorator
      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['charm_person'] = static_spell_attributes
            result['mirror_image'] = static_spell_attributes
          end
          result['command'] = static_spell_attributes if class_level >= 6
          result
        end
      end

      private

      def class_level
        classes['bard']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
