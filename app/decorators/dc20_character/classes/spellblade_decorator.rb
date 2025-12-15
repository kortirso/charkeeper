# frozen_string_literal: true

module Dc20Character
  module Classes
    class SpellbladeDecorator < ApplicationDecorator
      def mana_points
        @mana_points ||= __getobj__.mana_points.merge('max' => mana_points_by_level)
      end

      def stamina_points
        @stamina_points ||= __getobj__.stamina_points.merge('max' => ((level / 6) + 1))
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

      def cantrips
        @cantrips ||= __getobj__.cantrips + cantrips_by_level
      end

      def spells
        @spells ||= __getobj__.spells + spells_by_level
      end

      def max_health
        @max_health ||= begin
          class_bonus = ((level / 2) * 5) + (level.even? ? 0 : 3)
          6 + class_bonus + modified_abilities['mig']
        end
      end

      private

      def class_maneuver_points
        return 3 if level >= 5

        2
      end

      def class_technique_points
        return 2 if level >= 8
        return 1 if level >= 3

        0
      end

      def mana_points_by_level
        return 8 if level >= 9
        return 7 if level >= 8
        return 6 if level >= 6
        return 5 if level >= 5
        return 4 if level >= 3

        3
      end

      def cantrips_by_level
        return 4 if level >= 8
        return 3 if level >= 5
        return 2 if level >= 3

        1
      end

      def spells_by_level
        return 3 if level >= 9
        return 2 if level >= 6

        1
      end
    end
  end
end
