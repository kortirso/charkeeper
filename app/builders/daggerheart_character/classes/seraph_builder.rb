# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class SeraphBuilder
      def call(result:)
        result[:evasion] = 9
        result[:health_max] = 7
        result[:stress_max] = 6
        result[:hope_max] = 6
        result
      end
    end
  end
end
