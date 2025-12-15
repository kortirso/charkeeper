# frozen_string_literal: true

module Dc20Character
  module Classes
    class CommanderDecorator < ApplicationDecorator
      def stamina_points
        @stamina_points ||= __getobj__.stamina_points.merge('max' => ((level / 3) + 1))
      end

      def rest_points
        @rest_points ||= __getobj__.rest_points.merge('max' => max_health)
      end

      def maneuver_points
        @maneuver_points ||= __getobj__.maneuver_points + class_maneuver_points + 3 # 3 - number of attack maneuvers
      end

      def technique_points
        @technique_points ||= __getobj__.technique_points + class_technique_points + 3 # 3 - number of attack maneuvers
      end

      def max_health
        @max_health ||= 6 + (3 * level) + modified_abilities['mig']
      end

      private

      def class_maneuver_points
        return 6 if level >= 8
        return 5 if level >= 5

        4
      end

      def class_technique_points
        return 3 if level >= 8
        return 2 if level >= 5
        return 1 if level >= 3

        0
      end
    end
  end
end
