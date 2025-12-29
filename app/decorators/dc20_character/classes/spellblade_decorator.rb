# frozen_string_literal: true

module Dc20Character
  module Classes
    class SpellbladeDecorator < ApplicationDecorator
      def mana_points
        @mana_points ||= __getobj__.mana_points.merge('max' => mana_points_by_level)
      end

      def stamina_points
        @stamina_points ||= __getobj__.stamina_points.merge('max' => ((level + 3) / 4))
      end

      def maneuver_points
        @maneuver_points ||= __getobj__.maneuver_points + class_maneuver_points
      end

      def spells
        @spells ||= __getobj__.spells + ((level + 3) / 4) + 1
      end

      def max_health
        @max_health ||= __getobj__.max_health + 6 + level + ((level + 1) / 2) + modified_abilities['mig']
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
