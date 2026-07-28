# frozen_string_literal: true

module NimbleCharacter
  module Classes
    class CheatBuilder
      def call(result:)
        result[:health] = { 'current' => 10, 'temp' => 0, 'max' => 10 }
        result[:weapons] = %w[melee-dex range-dex]

        result
      end
    end
  end
end
