# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class FiendDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['burning_hands'] = static_spell_attributes
            result['command'] = static_spell_attributes
            result['scorching_ray'] = static_spell_attributes
            result['suggestion'] = static_spell_attributes
          end
          if class_level >= 5
            result['fireball'] = static_spell_attributes
            result['stinking_cloud'] = static_spell_attributes
          end
          if class_level >= 7
            result['fire_shield'] = static_spell_attributes
            result['wall_of_fire'] = static_spell_attributes
          end
          if class_level >= 9
            result['geas'] = static_spell_attributes
            result['insect_plague'] = static_spell_attributes
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
