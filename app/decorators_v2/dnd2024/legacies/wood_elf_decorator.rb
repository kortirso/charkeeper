# frozen_string_literal: true

module Dnd2024
  module Legacies
    class WoodElfDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells
        return unless selected_features['elven_spellcasting']

        @result['static_spells']['druidcraft'] = static_spell_attributes
        @result['static_spells']['longstrider'] = static_spell_attributes if level >= 3
        @result['static_spells']['pass_without_trace'] = static_spell_attributes if level >= 5
      end

      def static_spell_attributes
        {
          'attack_bonus' => proficiency_bonus + modifiers[selected_features['elven_spellcasting']],
          'save_dc' => 8 + proficiency_bonus + modifiers[selected_features['elven_spellcasting']]
        }
      end
    end
  end
end
