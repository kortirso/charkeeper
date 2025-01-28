# frozen_string_literal: true

module Dnd5NewCharacter
  module Subraces
    class WoodElfDecorator
      WEAPONS = %w[Longsword Shortsword Longbow Shortbow].freeze

      def decorate(result:)
        result[:speed] = 35
        result[:weapon_skills] = result[:weapon_skills].concat(WEAPONS)

        result
      end
    end
  end
end
