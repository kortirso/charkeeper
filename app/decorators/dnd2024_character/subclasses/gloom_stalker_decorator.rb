# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class GloomStalkerDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['disguise_self'] = static_spell_attributes
          end
          if class_level >= 5
            result['rope_trick'] = static_spell_attributes
          end
          if class_level >= 9
            result['fear'] = static_spell_attributes
          end
          if class_level >= 13
            result['greater_invisibility'] = static_spell_attributes
          end
          if class_level >= 17
            result['seeming'] = static_spell_attributes
          end
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
