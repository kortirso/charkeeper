# frozen_string_literal: true

module Dnd5Character
  module Races
    class TieflingDecorator < ApplicationDecorator
      def darkvision
        60
      end

      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          result['thaumaturgy'] = static_spell_attributes
          result['hellish_rebuke'] = static_spell_attributes.merge({ 'limit' => 1, 'level' => 2 }) if level >= 3
          result['darkness'] = static_spell_attributes.merge({ 'limit' => 1 }) if level >= 5
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
