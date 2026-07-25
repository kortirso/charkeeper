# frozen_string_literal: true

module Dc20Character
  module Classes
    class MonkBuilder
      COMBAT_EXPERTISE = %w[weapon light_armor].freeze

      def call(result:)
        result[:combat_expertise] = COMBAT_EXPERTISE
        result[:health] = { current: 8, temp: 0 }
        result[:path] = ['martial']

        result
      end
    end
  end
end
