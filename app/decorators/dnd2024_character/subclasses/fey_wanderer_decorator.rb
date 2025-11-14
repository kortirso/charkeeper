# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class FeyWandererDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          result['charm_person'] = static_spell_attributes if class_level >= 3
          result['misty_step'] = static_spell_attributes if class_level >= 5
          result['summon_fey'] = static_spell_attributes if class_level >= 9
          result['dimension_door'] = static_spell_attributes if class_level >= 13
          result['misty_step'] = static_spell_attributes if class_level >= 15
          result['mislead'] = static_spell_attributes if class_level >= 17
          result
        end
      end

      private

      def class_level
        classes['ranger']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
