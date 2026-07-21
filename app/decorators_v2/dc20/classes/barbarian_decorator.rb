# frozen_string_literal: true

module Dc20
  module Classes
    class BarbarianDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['max_stamina_points'] = class_stamina_points
        @result['max_mana_points'] = 0
        @result['maneuver_points'] = class_maneuver_points
        @result['max_health'] = 6 + (2 * level) + modified_abilities['mig']
        @result['spells'] = 0
        @result['spell_lists_amount'] = 0
        @result
      end

      private

      def class_stamina_points
        return 6 if level >= 10
        return 5 if level >= 9
        return 4 if level >= 7
        return 3 if level >= 3

        2
      end

      def class_maneuver_points
        return 7 if level >= 10
        return 6 if level >= 9
        return 5 if level >= 7
        return 4 if level >= 5
        return 3 if level >= 3

        2
      end
    end
  end
end
