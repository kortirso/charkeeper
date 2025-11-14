# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class ClockworkDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['aid'] = static_spell_attributes
            result['alarm'] = static_spell_attributes
            result['lesser_restoration'] = static_spell_attributes
            result['protection_from_evil_and_good'] = static_spell_attributes
          end
          if class_level >= 5
            result['dispel_magic'] = static_spell_attributes
            result['protection_from_energy'] = static_spell_attributes
          end
          if class_level >= 7
            result['freedom_of_movement'] = static_spell_attributes
            result['summon_construct'] = static_spell_attributes
          end
          if class_level >= 9
            result['greater_restoration'] = static_spell_attributes
            result['wall_of_force'] = static_spell_attributes
          end
          result
        end
      end

      private

      def class_level
        classes['sorcerer']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
