# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class BardBuilder
      def call(result:)
        result[:evasion] = 10
        result[:health_max] = 5
        result[:stress_max] = 6
        result[:hope_max] = 6
        result[:traits] = { 'str' => -1, 'agi' => 0, 'fin' => 1, 'ins' => 0, 'pre' => 2, 'know' => 1 }
        result
      end
    end
  end
end
