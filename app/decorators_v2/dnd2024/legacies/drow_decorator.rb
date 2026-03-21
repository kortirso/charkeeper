# frozen_string_literal: true

module Dnd2024
  module Legacies
    class DrowDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells
        return unless selected_features['elven_spellcasting']

        @result['static_spells']['dancing_lights'] = static_spell_attributes
        @result['static_spells']['faerie_fire'] = static_spell_attributes if level >= 3
        @result['static_spells']['darkness'] = static_spell_attributes if level >= 5
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
