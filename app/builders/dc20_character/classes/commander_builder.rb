# frozen_string_literal: true

module Dc20Character
  module Classes
    class CommanderBuilder
      COMBAT_EXPERTISE = %w[weapon light_armor heavy_armor shield].freeze

      def call(result:)
        result[:combat_expertise] = COMBAT_EXPERTISE
        result[:health] = { current: 9, temp: 0 }

        result
      end
    end
  end
end
