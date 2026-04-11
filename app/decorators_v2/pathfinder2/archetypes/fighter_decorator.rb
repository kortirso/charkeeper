# frozen_string_literal: true

module Pathfinder2
  module Archetypes
    class FighterDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        update_max_health
      end

      private

      def update_max_health
        return if available_features_slugs.exclude?('fighter_resiliency')
        return if Pathfinder2Decorator::CLASS_HP[main_class] > 8

        @result['health']['max'] += 3 * archetypes['fighter']
      end
    end
  end
end
