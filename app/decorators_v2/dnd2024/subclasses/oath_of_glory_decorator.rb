# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class OathOfGloryDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['guiding_bolt'] = static_spell_attributes
          @result['static_spells']['heroism'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['enhance_ability'] = static_spell_attributes
          @result['static_spells']['magic_weapon'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['haste'] = static_spell_attributes
          @result['static_spells']['protection_from_energy'] = static_spell_attributes
        end
        if class_level >= 13
          @result['static_spells']['compulsion'] = static_spell_attributes
          @result['static_spells']['freedom_of_movement'] = static_spell_attributes
        end
        if class_level >= 17
          @result['static_spells']['legend_lore'] = static_spell_attributes
          @result['static_spells']['yolande_regal_presence'] = static_spell_attributes
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
