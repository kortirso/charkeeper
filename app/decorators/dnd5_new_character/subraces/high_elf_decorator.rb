# frozen_string_literal: true

module Dnd5NewCharacter
  module Subraces
    class HighElfDecorator
      WEAPONS = %w[Longsword Shortsword Longbow Shortbow].freeze

      def decorate(result:)
        result[:weapon_skills] = result[:weapon_skills].concat(WEAPONS)

        result
      end
    end
  end
end
