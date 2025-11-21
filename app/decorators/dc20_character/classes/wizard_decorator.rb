# frozen_string_literal: true

module Dc20Character
  module Classes
    class WizardDecorator < ApplicationDecorator
      def health
        @health ||= __getobj__.health.merge(
          'max' => max_health,
          'bloodied' => max_health / 2,
          'well_bloodied' => max_health / 4,
          'death_threshold' => 0 - modified_abilities['prime'] - combat_mastery
        )
      end

      def mana_points
        @mana_points ||= __getobj__.mana_points.merge('max' => mana_points_by_level)
      end

      def rest_points
        @rest_points ||= __getobj__.rest_points.merge('max' => max_health)
      end

      def cantrips
        @cantrips ||= __getobj__.cantrips + cantrips_by_level
      end

      def spells
        @spells ||= __getobj__.spells + spells_by_level
      end

      private

      def max_health
        @max_health ||= 6 + (2 * level) + modified_abilities['mig']
      end

      def mana_points_by_level
        return 16 if level >= 9
        return 14 if level >= 8
        return 12 if level >= 6
        return 10 if level >= 5
        return 8 if level >= 3

        6
      end

      def cantrips_by_level
        return 4 if level >= 8
        return 3 if level >= 5

        2
      end

      def spells_by_level
        return 6 if level >= 9
        return 5 if level >= 6
        return 4 if level >= 3

        3
      end
    end
  end
end
