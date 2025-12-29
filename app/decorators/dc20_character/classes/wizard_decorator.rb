# frozen_string_literal: true

module Dc20Character
  module Classes
    class WizardDecorator < ApplicationDecorator
      def mana_points
        @mana_points ||= __getobj__.mana_points.merge('max' => mana_points_by_level)
      end

      def spells
        @spells ||= __getobj__.spells + spells_by_level
      end

      def spell_lists_amount
        1
      end

      def max_health
        @max_health ||= __getobj__.max_health + 6 + level + modified_abilities['mig']
      end

      private

      def mana_points_by_level
        return 18 if level >= 10
        return 16 if level >= 9
        return 13 if level >= 7
        return 11 if level >= 5
        return 8 if level >= 3

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
