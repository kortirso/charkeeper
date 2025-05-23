# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class HighElfBuilder
      WEAPONS = %w[longsword shortsword longbow shortbow].freeze

      def call(result:)
        result[:weapon_skills] = result[:weapon_skills].concat(WEAPONS).uniq

        result
      end
    end
  end
end
