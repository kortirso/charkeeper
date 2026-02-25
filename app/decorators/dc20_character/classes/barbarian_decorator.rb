# frozen_string_literal: true

module Dc20Character
  module Classes
    class BarbarianDecorator < ApplicationDecorator
      def stamina_points
        @stamina_points ||= __getobj__.stamina_points.merge('max' => class_stamina_points)
      end

      def maneuver_points
        @maneuver_points ||= __getobj__.maneuver_points + class_maneuver_points
      end

      def max_health
        @max_health ||= __getobj__.max_health + 6 + (2 * level) + modified_abilities['mig']
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
