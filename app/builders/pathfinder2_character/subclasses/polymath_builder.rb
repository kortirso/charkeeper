# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class PolymathBuilder
      def call(result:)
        result[:feats] = result[:feats].push('versatile_performance').uniq
        result[:spells] = result[:spells].push('phantasmal_minion').uniq

        result
      end
    end
  end
end
