# frozen_string_literal: true

module Dc20Character
  module Classes
    class SorcererBuilder
      COMBAT_EXPERTISE = %w[light_armor focuses].freeze

      def call(result:)
        result[:combat_expertise] = COMBAT_EXPERTISE
        result[:health] = { current: 7, temp: 0 }

        result
      end
    end
  end
end
