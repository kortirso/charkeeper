# frozen_string_literal: true

module Pathfinder2Character
  module Subraces
    class DeepOrcBuilder
      def call(result:)
        result[:feats] = result[:feats].push('combat_climber', 'terrain_expertise').uniq

        result
      end
    end
  end
end
