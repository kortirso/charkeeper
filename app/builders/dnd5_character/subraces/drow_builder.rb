# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class DrowBuilder
      WEAPONS = %w[shortsword rapier hand_crossbow].freeze

      def call(result:)
        result[:weapon_skills] = result[:weapon_skills].concat(WEAPONS).uniq

        result
      end
    end
  end
end
