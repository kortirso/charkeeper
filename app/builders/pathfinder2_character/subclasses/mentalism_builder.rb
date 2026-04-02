# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class MentalismBuilder
      def call(result:)
        result[:focus_spells] = result[:focus_spells].push('charming_push').uniq

        result
      end
    end
  end
end
