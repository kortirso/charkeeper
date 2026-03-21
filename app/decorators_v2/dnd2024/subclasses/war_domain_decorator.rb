# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class WarDomainDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        return if class_level < 3

        @result['static_spells']['guiding_bolt'] = static_spell_attributes
        @result['static_spells']['magic_weapon'] = static_spell_attributes
        @result['static_spells']['shield_of_faith'] = static_spell_attributes
        @result['static_spells']['spiritual_weapon'] = static_spell_attributes
        return if class_level < 5

        @result['static_spells']['crusader_mantle'] = static_spell_attributes
        @result['static_spells']['spirit_guardians'] = static_spell_attributes
        return if class_level < 7

        @result['static_spells']['fire_shield'] = static_spell_attributes
        @result['static_spells']['freedom_of_movement'] = static_spell_attributes
        return if class_level < 9

        @result['static_spells']['hold_monster'] = static_spell_attributes
        @result['static_spells']['steel_wind_strike'] = static_spell_attributes
      end

      def class_level
        classes['cleric']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
