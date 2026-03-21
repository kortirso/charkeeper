# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class FeyWandererDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        @result['static_spells']['charm_person'] = static_spell_attributes if class_level >= 3
        @result['static_spells']['misty_step'] = static_spell_attributes if class_level >= 5
        @result['static_spells']['summon_fey'] = static_spell_attributes if class_level >= 9
        @result['static_spells']['dimension_door'] = static_spell_attributes if class_level >= 13
        @result['static_spells']['mislead'] = static_spell_attributes if class_level >= 17
      end

      def class_level
        classes['ranger']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
