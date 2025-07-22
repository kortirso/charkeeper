# frozen_string_literal: true

module Dnd2024Character
  module Species
    class AasimarDecorator < ApplicationDecorator
      def darkvision
        60
      end

      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          result['light'] = static_spell_attributes
          result
        end
      end

      private

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
