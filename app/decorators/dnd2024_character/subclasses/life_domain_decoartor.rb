# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class LifeDomainDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['protection_from_evil_and_good'] = static_spell_attributes
            result['shield_of_faith'] = static_spell_attributes
          end
          if class_level >= 5
            result['aid'] = static_spell_attributes
            result['zone_of_truth'] = static_spell_attributes
          end
          if class_level >= 9
            result['beacon_of_hope'] = static_spell_attributes
            result['dispel_magic'] = static_spell_attributes
          end
          if class_level >= 13
            result['freedom_of_movement'] = static_spell_attributes
            result['guardian_of_faith'] = static_spell_attributes
          end
          if class_level >= 17
            result['commune'] = static_spell_attributes
            result['flame_strike'] = static_spell_attributes
          end
          result
        end
      end

      private

      def class_level
        classes['paladin']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
