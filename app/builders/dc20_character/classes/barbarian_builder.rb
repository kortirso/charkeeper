# frozen_string_literal: true

module Dc20Character
  module Classes
    class BarbarianBuilder
      COMBAT_EXPERTISE = %w[weapon light_armor heavy_armor light_shield heavy_shield].freeze

      def call(result:)
        result[:combat_expertise] = COMBAT_EXPERTISE
        result[:health] = { current: 8, temp: 0 }
        result[:path] = ['martial']

        result
      end
    end
  end
end
