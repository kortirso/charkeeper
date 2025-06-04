# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class BardBuilder
      def call(result:)
        result[:evasion] = 10
        result[:health_max] = 5
        result[:stress_max] = 6
        result[:hope_max] = 6
        result
      end
    end
  end
end
