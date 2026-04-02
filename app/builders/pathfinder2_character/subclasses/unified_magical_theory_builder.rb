# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class UnifiedMagicalTheoryBuilder
      def call(result:)
        result[:focus_spells] = result[:focus_spells].push('hand_of_the_apprentice').uniq

        result
      end
    end
  end
end
