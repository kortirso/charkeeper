# frozen_string_literal: true

module Dc20Character
  module Classes
    class CommanderBuilder
      COMBAT_MASTERIES = %w[weapon light_armor heavy_armor shield].freeze

      def call(result:)
        result[:combat_masteries] = COMBAT_MASTERIES
        result[:health] = { current: 9, temp: 0 }

        result
      end
    end
  end
end
