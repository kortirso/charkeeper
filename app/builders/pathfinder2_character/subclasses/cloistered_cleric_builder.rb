# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class CloisteredClericBuilder
      def call(result:)
        result[:feats] = result[:feats].push('domain_initiate').uniq

        result
      end
    end
  end
end
