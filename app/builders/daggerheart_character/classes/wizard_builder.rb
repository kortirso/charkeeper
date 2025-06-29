# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class WizardBuilder
      def call(result:)
        result[:evasion] = 11
        result[:health_max] = 5
        result[:stress_max] = 6
        result[:hope_max] = 6
        result[:traits] = { 'str' => 0, 'agi' => -1, 'fin' => 0, 'ins' => 1, 'pre' => 1, 'know' => 2 }
        result
      end
    end
  end
end
