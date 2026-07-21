# frozen_string_literal: true

module Dc20
  module Classes
    class SpellbladeDecorator < ApplicationDecoratorV2
      def call(result:) # rubocop: disable Metrics/AbcSize
        @result = result
        @result['max_stamina_points'] = ((level + 3) / 4)
        @result['max_mana_points'] = mana_points_by_level
        @result['maneuver_points'] = class_maneuver_points
        @result['max_health'] = 6 + level + ((level + 1) / 2) + modified_abilities['mig']
        @result['spells'] = ((level + 3) / 4) + 1
        @result['spell_lists_amount'] = 0
        @result
      end

      private

      def class_maneuver_points
        return 4 if level >= 10
        return 3 if level >= 7
        return 2 if level >= 3

        1
      end

      def mana_points_by_level
        return 9 if level >= 10
        return 8 if level >= 9
        return 6 if level >= 7
        return 5 if level >= 5
        return 4 if level >= 3

        2
      end
    end
  end
end
