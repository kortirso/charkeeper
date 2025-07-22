# frozen_string_literal: true

module Dnd2024Character
  module Legacies
    class DrowDecorator < ApplicationDecorator
      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          if selected_features['elven_spellcasting']
            result['dancing_lights'] = static_spell_attributes
            result['faerie_fire'] = static_spell_attributes if level >= 3
            result['darkness'] = static_spell_attributes if level >= 5
          end
          result
        end
      end

      private

      def static_spell_attributes
        {
          'attack_bonus' => proficiency_bonus + modifiers[selected_features['elven_spellcasting']],
          'save_dc' => 8 + proficiency_bonus + modifiers[selected_features['elven_spellcasting']]
        }
      end
    end
  end
end
