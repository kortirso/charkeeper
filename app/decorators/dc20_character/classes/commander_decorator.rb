# frozen_string_literal: true

module Dc20Character
  module Classes
    class CommanderDecorator < ApplicationDecorator
      def health
        @health ||= __getobj__.health.merge(
          'max' => max_health,
          'bloodied' => max_health / 2,
          'well_bloodied' => max_health / 4
        )
      end

      def stamina_points
        @stamina_points ||= __getobj__.stamina_points.merge('max' => ((class_level / 3) + 1))
      end

      def maneuver_points
        @maneuver_points ||= __getobj__.maneuver_points + class_maneuver_points + 3 # 3 - number of attack maneuvers
      end

      private

      def class_level
        @class_level ||= classes['commander']
      end

      def max_health
        @max_health ||= 6 + (3 * class_level) + modified_abilities['mig']
      end

      def class_maneuver_points
        return 6 if class_level >= 8
        return 5 if class_level >= 5

        4
      end
    end
  end
end
