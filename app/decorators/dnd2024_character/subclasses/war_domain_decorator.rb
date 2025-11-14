# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class WarDomainDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['guiding_bolt'] = static_spell_attributes
            result['magic_weapon'] = static_spell_attributes
            result['shield_of_faith'] = static_spell_attributes
            result['spiritual_weapon'] = static_spell_attributes
          end
          if class_level >= 5
            result['crusader_mantle'] = static_spell_attributes
            result['spirit_guardians'] = static_spell_attributes
          end
          if class_level >= 7
            result['fire_shield'] = static_spell_attributes
            result['freedom_of_movement'] = static_spell_attributes
          end
          if class_level >= 9
            result['hold_monster'] = static_spell_attributes
            result['steel_wind_strike'] = static_spell_attributes
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
