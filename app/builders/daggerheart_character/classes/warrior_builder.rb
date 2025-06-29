# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class WarriorBuilder
      def call(result:)
        result[:evasion] = 11
        result[:health_max] = 6
        result[:stress_max] = 6
        result[:hope_max] = 6
        result[:traits] = { 'str' => 1, 'agi' => 2, 'fin' => 0, 'ins' => 1, 'pre' => -1, 'know' => 0 }
        result
      end
    end
  end
end
