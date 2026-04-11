# frozen_string_literal: true

module Pathfinder2
  module Concerns
    private

    def proficiency_bonus(proficiency_level)
      return 0 if proficiency_level.to_i.zero?

      level + (proficiency_level * 2)
    end
  end
end
