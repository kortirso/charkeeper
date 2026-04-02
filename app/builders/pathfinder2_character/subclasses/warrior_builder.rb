# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class WarriorBuilder
      def call(result:)
        result[:feats] = result[:feats].push('martial_performance').uniq
        result[:spells] = result[:spells].push('fear').uniq

        result
      end
    end
  end
end
