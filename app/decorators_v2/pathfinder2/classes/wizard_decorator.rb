# frozen_string_literal: true

module Pathfinder2
  module Classes
    class WizardDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['spells_info'] = {
          'prepare' => true,
          'learn' => true,
          'cantrips_amount' => 10,
          'spells_amount' => (level * 2) + 3,
          'cantrip_slots' => 5,
          'spells_slots' => spells_slots,
          'max_spell_level' => spells_slots.keys.max,
          'class_dc' => class_dc,
          'spell_attack' => spell_attack,
          'spell_dc' => spell_dc
        }
      end

      private

      def spells_slots
        @spells_slots ||= ::Pathfinder2::ClassDecorator::SPELL_SLOTS[level] || ::Pathfinder2::ClassDecorator::SPELL_SLOTS[20]
      end
    end
  end
end
