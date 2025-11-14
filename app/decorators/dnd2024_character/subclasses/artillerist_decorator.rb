# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class ArtilleristDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['shield'] = static_spell_attributes
            result['thunderwave'] = static_spell_attributes
          end
          if class_level >= 5
            result['scorching_ray'] = static_spell_attributes
            result['shatter'] = static_spell_attributes
          end
          if class_level >= 9
            result['fireball'] = static_spell_attributes
            result['wind_wall'] = static_spell_attributes
          end
          if class_level >= 13
            result['ice_storm'] = static_spell_attributes
            result['wall_of_fire'] = static_spell_attributes
          end
          if class_level >= 17
            result['cone_of_cold'] = static_spell_attributes
            result['wall_of_force'] = static_spell_attributes
          end
          result
        end
      end

      private

      def class_level
        classes['artificer']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['int'], 'save_dc' => 8 + proficiency_bonus + modifiers['int'] }
      end
    end
  end
end
