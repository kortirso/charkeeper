# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class BattleSmithDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['heroism'] = static_spell_attributes
          @result['static_spells']['shield'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['shining_smite'] = static_spell_attributes
          @result['static_spells']['warding_bond'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['aura_of_vitality'] = static_spell_attributes
          @result['static_spells']['conjure_barrage'] = static_spell_attributes
        end
        if class_level >= 13
          @result['static_spells']['aura_of_purity'] = static_spell_attributes
          @result['static_spells']['fire_shield'] = static_spell_attributes
        end
        if class_level >= 17
          @result['static_spells']['banishing_smite'] = static_spell_attributes
          @result['static_spells']['mass_cure_wounds'] = static_spell_attributes
        end
      end

      def class_level
        classes['artificer']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['int'], 'save_dc' => 8 + proficiency_bonus + modifiers['int'] }
      end
    end
  end
end
