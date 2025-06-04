# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class WarriorBuilder
      def call(result:)
        result[:evasion] = 11
        result[:health_max] = 6
        result[:stress_max] = 6
        result[:hope_max] = 6
        result
      end
    end
  end
end
