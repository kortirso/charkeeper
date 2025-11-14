# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class LightDomainDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['burning_hands'] = static_spell_attributes
            result['faerie_fire'] = static_spell_attributes
            result['scorching_ray'] = static_spell_attributes
            result['see_invisibility'] = static_spell_attributes
          end
          if class_level >= 5
            result['daylight'] = static_spell_attributes
            result['fireball'] = static_spell_attributes
          end
          if class_level >= 7
            result['arcane_eye'] = static_spell_attributes
            result['wall_of_fire'] = static_spell_attributes
          end
          if class_level >= 9
            result['flame_strike'] = static_spell_attributes
            result['scrying'] = static_spell_attributes
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
