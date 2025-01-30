# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class WoodElfDecorator
      WEAPONS = %w[Longsword Shortsword Longbow Shortbow].freeze

      def decorate_fresh_character(result:)
        result[:speed] = 35
        result[:weapon_skills] = result[:weapon_skills].concat(WEAPONS)

        result
      end
    end
  end
end
