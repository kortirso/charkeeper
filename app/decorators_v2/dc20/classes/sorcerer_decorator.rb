# frozen_string_literal: true

module Dc20
  module Classes
    class SorcererDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['max_stamina_points'] = paths['martial']
        @result['max_mana_points'] = mana_points_by_level
        @result['maneuver_points'] = paths['martial']
        @result['max_health'] = 6 + level + modified_abilities['mig']
        @result['spells'] = spells_by_level
        @result['spell_lists_amount'] = 1
        @result
      end

      private

      def mana_points_by_level
        return 21 if level >= 10
        return 18 if level >= 9
        return 15 if level >= 7
        return 12 if level >= 5
        return 9 if level >= 3

        6
      end

      def spells_by_level
        return 9 if level >= 10
        return 8 if level >= 9
        return 7 if level >= 7
        return 6 if level >= 5
        return 5 if level >= 3

        4
      end
    end
  end
end
