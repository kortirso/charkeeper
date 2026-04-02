# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class ArsGrammaticaBuilder
      def call(result:)
        result[:focus_spells] = result[:focus_spells].push('protective_wards').uniq

        result
      end
    end
  end
end
