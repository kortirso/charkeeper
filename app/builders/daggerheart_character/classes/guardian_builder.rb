# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class GuardianBuilder
      def call(result:)
        result[:evasion] = 9
        result[:health] = { marked: 0, max: 7 }
        result[:stress] = { marked: 0, max: 6 }
        result[:hope] = { marked: 2, max: 6 }
        result
      end
    end
  end
end
