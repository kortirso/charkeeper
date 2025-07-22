# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class HighElfDecorator < ApplicationDecorator
      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          find_cantrip(result)
          result
        end
      end

      private

      def find_cantrip(result)
        cantrip =
          Dnd5::Spell
            .where('available_for && ?', '{wizard}')
            .where("data ->> 'level' = '0'")
            .where("name ->> 'en' = :name OR name ->> 'ru' = :name", name: selected_feats['high_elf_cantrip'])
            .first
        return if cantrip.nil?

        result.merge!({ cantrip.slug => static_spell_attributes })
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['int'], 'save_dc' => 8 + proficiency_bonus + modifiers['int'] }
      end
    end
  end
end
