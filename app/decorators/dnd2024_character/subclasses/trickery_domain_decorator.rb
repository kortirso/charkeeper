# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class TrickeryDomainDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['charm_person'] = static_spell_attributes
            result['disguise_self'] = static_spell_attributes
            result['invisibility'] = static_spell_attributes
            result['pass_without_trace'] = static_spell_attributes
          end
          if class_level >= 5
            result['hypnotic_pattern'] = static_spell_attributes
            result['nondetection'] = static_spell_attributes
          end
          if class_level >= 7
            result['confusion'] = static_spell_attributes
            result['dimension_door'] = static_spell_attributes
          end
          if class_level >= 9
            result['dominate_person'] = static_spell_attributes
            result['modify_memory'] = static_spell_attributes
          end
          result
        end
      end

      private

      def class_level
        classes['cleric']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
