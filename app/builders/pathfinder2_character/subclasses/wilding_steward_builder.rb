# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class WildingStewardBuilder
      def call(result:)
        if result[:selected_skills][:nature]
          result[:skill_boosts][:free] += 1
        else
          result[:selected_skills][:nature] = 1
        end

        result
      end
    end
  end
end
