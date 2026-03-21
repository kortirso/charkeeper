# frozen_string_literal: true

module Dnd2024
  module Legacies
    class RockGnomeDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells
        return unless selected_features['gnome_spellcasting']

        @result['static_spells']['mending'] = static_spell_attributes
        @result['static_spells']['prestidigitation'] = static_spell_attributes
      end

      def static_spell_attributes
        {
          'attack_bonus' => proficiency_bonus + modifiers[selected_features['gnome_spellcasting']],
          'save_dc' => 8 + proficiency_bonus + modifiers[selected_features['gnome_spellcasting']]
        }
      end
    end
  end
end
