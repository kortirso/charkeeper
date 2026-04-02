# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class TheBoundaryBuilder
      def call(result:)
        result[:focus_spells] = result[:focus_spells].push('fortify_summoning').uniq

        result
      end
    end
  end
end
