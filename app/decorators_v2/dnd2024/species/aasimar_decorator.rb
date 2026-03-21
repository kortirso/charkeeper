# frozen_string_literal: true

module Dnd2024
  module Species
    class AasimarDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['darkvision'] = 60
        find_static_spells
        @result
      end

      private

      def find_static_spells
        @result['static_spells']['light'] = static_spell_attributes
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
