# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class OathOfVengeanceDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['bane'] = static_spell_attributes
          @result['static_spells']['hunter_mark'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['hold_person'] = static_spell_attributes
          @result['static_spells']['misty_step'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['haste'] = static_spell_attributes
          @result['static_spells']['protection_from_energy'] = static_spell_attributes
        end
        if class_level >= 13
          @result['static_spells']['banishment'] = static_spell_attributes
          @result['static_spells']['dimension_door'] = static_spell_attributes
        end
        if class_level >= 17
          @result['static_spells']['hold_monster'] = static_spell_attributes
          @result['static_spells']['scrying'] = static_spell_attributes
        end
      end

      def class_level
        classes['paladin']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
