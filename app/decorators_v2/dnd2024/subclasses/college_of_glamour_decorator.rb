# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class CollegeOfGlamourDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells
        if class_level >= 3
          @result['static_spells']['charm_person'] = static_spell_attributes
          @result['static_spells']['mirror_image'] = static_spell_attributes
        end
        @result['static_spells']['command'] = static_spell_attributes if class_level >= 6
      end

      def class_level
        classes['bard']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
