# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class HighElfDecorator
      WEAPONS = %w[Longsword Shortsword Longbow Shortbow].freeze

      def decorate_fresh_character(result:)
        result[:weapon_skills] = result[:weapon_skills].concat(WEAPONS)

        result
      end
    end
  end
end
