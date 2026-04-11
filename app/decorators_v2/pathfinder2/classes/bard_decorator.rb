# frozen_string_literal: true

module Pathfinder2
  module Classes
    class BardDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['spells_info'] = {
          'prepare' => false,
          'learn' => true,
          'cantrips_amount' => 5,
          'spells_amount' => spells_slots.values.sum,
          'spells_slots' => spells_slots,
          'max_spell_level' => spells_slots.keys.max
        }
      end

      private

      def spells_slots
        @spells_slots ||= ::Pathfinder2::ClassDecorator::SPELL_SLOTS[level] || ::Pathfinder2::ClassDecorator::SPELL_SLOTS[20]
      end
    end
  end
end
