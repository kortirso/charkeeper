# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class DrowDecorator < ApplicationDecorator
      def darkvision
        120
      end

      def static_spells
        @static_spells ||= begin
          result = __getobj__.static_spells
          result['dancing_lights'] = static_spell_attributes
          result['faerie_fire'] = static_spell_attributes.merge({ 'limit' => 1 }) if level >= 3
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
