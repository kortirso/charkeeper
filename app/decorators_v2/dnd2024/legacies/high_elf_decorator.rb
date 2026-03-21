# frozen_string_literal: true

module Dnd2024
  module Legacies
    class HighElfDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells
        return unless selected_features['elven_spellcasting']

        find_cantrip if selected_features['high_elf_legacy_0']
        @result['static_spells']['detect_magic'] = static_spell_attributes if level >= 3
        @result['static_spells']['misty_step'] = static_spell_attributes if level >= 5
      end

      def find_cantrip
        cantrip =
          Dnd2024::Feat
            .where('origin_values && ?', '{wizard}')
            .where("info ->> 'level' = '0'")
            .where("title ->> 'en' = :name OR title ->> 'ru' = :name", name: selected_features['high_elf_legacy_0'])
            .first
        return if cantrip.nil?

        @result['static_spells'][cantrip.slug] = static_spell_attributes
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
