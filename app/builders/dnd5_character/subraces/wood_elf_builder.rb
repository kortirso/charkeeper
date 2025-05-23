# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class WoodElfBuilder
      WEAPONS = %w[longsword shortsword longbow shortbow].freeze

      def call(result:)
        result[:speed] = 35
        result[:weapon_skills] = result[:weapon_skills].concat(WEAPONS).uniq

        result
      end
    end
  end
end
