# frozen_string_literal: true

module Dnd2024Character
  module Legacies
    class ForestGnomeDecorator < ApplicationDecorator
      SPELLS = %w[minor_illusion speak_with_animals].freeze

      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          result.merge!(SPELLS.index_with { static_spell_attributes }) if selected_features['gnome_spellcasting']
          result
        end
      end

      private

      def static_spell_attributes
        {
          'attack_bonus' => proficiency_bonus + modifiers[selected_features['gnome_spellcasting']],
          'save_dc' => 8 + proficiency_bonus + modifiers[selected_features['gnome_spellcasting']]
        }
      end
    end
  end
end
