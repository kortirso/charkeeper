# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class BattleMagicBuilder
      def call(result:)
        result[:focus_spells] = result[:focus_spells].push('force_bolt').uniq

        result
      end
    end
  end
end
