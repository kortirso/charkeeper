# frozen_string_literal: true

module Dc20Character
  module Classes
    class CommanderDecorator < ApplicationDecorator
      def health
        @health ||= __getobj__.health.merge(
          'max' => max_health,
          'bloodied' => max_health / 2,
          'well_bloodied' => max_health / 4,
          'death_threshold' => 0 - modified_abilities['prime'] - combat_mastery
        )
      end

      def stamina_points
        @stamina_points ||= __getobj__.stamina_points.merge('max' => ((level / 3) + 1))
      end

      def rest_points
        @rest_points ||= __getobj__.rest_points.merge('max' => max_health)
      end

      def maneuver_points
        @maneuver_points ||= __getobj__.maneuver_points + class_maneuver_points + 3 # 3 - number of attack maneuvers
      end

      private

      def max_health
        @max_health ||= 6 + (3 * level) + modified_abilities['mig']
      end

      def class_maneuver_points
        return 6 if level >= 8
        return 5 if level >= 5

        4
      end
    end
  end
end
