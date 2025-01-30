# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class DrowDecorator
      WEAPONS = %w[shortsword rapier hand_crossbow].freeze

      def decorate_fresh_character(result:)
        result[:weapon_skills] = result[:weapon_skills].concat(WEAPONS).uniq

        result
      end
    end
  end
end
