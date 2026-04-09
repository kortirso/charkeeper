# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class MaestroBuilder
      def call(result:)
        result[:feats] = result[:feats].push('bard_lingering_composition').uniq
        result[:spells] = result[:spells].push('soothe').uniq

        result
      end
    end
  end
end
