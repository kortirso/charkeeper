# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class ArchfeyDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['calm_emotions'] = static_spell_attributes
            result['faerie_fire'] = static_spell_attributes
            result['misty_step'] = static_spell_attributes
            result['phantasmal_force'] = static_spell_attributes
            result['sleep'] = static_spell_attributes
          end
          if class_level >= 5
            result['blink'] = static_spell_attributes
            result['plant_growth'] = static_spell_attributes
          end
          if class_level >= 7
            result['dominate_beast'] = static_spell_attributes
            result['greater_invisibility'] = static_spell_attributes
          end
          if class_level >= 9
            result['dominate_person'] = static_spell_attributes
            result['seeming'] = static_spell_attributes
          end
          result
        end
      end

      private

      def class_level
        classes['warlock']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
