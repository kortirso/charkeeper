# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class ForestGnomeDecorator < ApplicationDecorator
      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          result['minor_illusion'] = static_spell_attributes
          result
        end
      end

      private

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['int'], 'save_dc' => 8 + proficiency_bonus + modifiers['int'] }
      end
    end
  end
end
