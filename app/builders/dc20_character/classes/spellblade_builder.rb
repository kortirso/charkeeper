# frozen_string_literal: true

module Dc20Character
  module Classes
    class SpellbladeBuilder
      COMBAT_EXPERTISE = %w[weapon light_armor light_shield].freeze

      def call(result:)
        result[:combat_expertise] = COMBAT_EXPERTISE
        result[:health] = { current: 9, temp: 0 }
        result[:path] = %w[martial spellcaster]

        result
      end
    end
  end
end
