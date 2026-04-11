# frozen_string_literal: true

module Pathfinder2
  module Classes
    class RangerDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['spells_info'] = find_spells_info if available_features_slugs.include?('initiate_warden')
      end

      private

      def find_spells_info
        {
          'only_focus' => true,
          'max_spell_level' => spells_slots.keys.max
        }
      end

      def spells_slots
        ::Pathfinder2::ClassDecorator::SPELL_SLOTS[[level, 20].min]
      end
    end
  end
end
