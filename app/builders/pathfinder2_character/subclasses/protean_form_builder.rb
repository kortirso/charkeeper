# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class ProteanFormBuilder
      def call(result:)
        result[:focus_spells] = result[:focus_spells].push('scramble_body').uniq

        result
      end
    end
  end
end
