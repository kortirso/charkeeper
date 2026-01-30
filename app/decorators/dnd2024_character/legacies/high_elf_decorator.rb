# frozen_string_literal: true

module Dnd2024Character
  module Legacies
    class HighElfDecorator < ApplicationDecorator
      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          if selected_features['elven_spellcasting']
            find_cantrip(result) if selected_features['high_elf_legacy_0']
            result['detect_magic'] = static_spell_attributes if level >= 3
            result['misty_step'] = static_spell_attributes if level >= 5
          end
          result
        end
      end

      private

      def find_cantrip(result)
        cantrip =
          Dnd2024::Feat
            .where('origin_values && ?', '{wizard}')
            .where("info ->> 'level' = '0'")
            .where("title ->> 'en' = :name OR title ->> 'ru' = :name", name: selected_features['high_elf_legacy_0'])
            .first
        return if cantrip.nil?

        result.merge!({ cantrip.slug => static_spell_attributes })
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
