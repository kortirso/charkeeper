# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class CelestialPatronDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['aid'] = static_spell_attributes
            result['cure_wounds'] = static_spell_attributes
            result['guiding_bolt'] = static_spell_attributes
            result['lesser_restoration'] = static_spell_attributes
            result['light'] = static_spell_attributes
            result['sacred_flame'] = static_spell_attributes
          end
          if class_level >= 5
            result['daylight'] = static_spell_attributes
            result['revivify'] = static_spell_attributes
          end
          if class_level >= 7
            result['guardian_of_faith'] = static_spell_attributes
            result['wall_of_fire'] = static_spell_attributes
          end
          if class_level >= 9
            result['greater_restoration'] = static_spell_attributes
            result['summon_celestial'] = static_spell_attributes
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
