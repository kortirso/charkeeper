# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class WoodElfDecorator
      WEAPONS = %w[longsword shortsword longbow shortbow].freeze

      def decorate_fresh_character(result:)
        result[:speed] = 35
        result[:weapon_skills] = result[:weapon_skills].concat(WEAPONS).uniq

        result
      end

      def decorate_character_abilities(result:)
        result
      end
    end
  end
end
