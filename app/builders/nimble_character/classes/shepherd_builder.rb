# frozen_string_literal: true

module NimbleCharacter
  module Classes
    class ShepherdBuilder
      def call(result:)
        result[:health] = { 'current' => 17, 'temp' => 0, 'max' => 17 }
        result[:weapons] = %w[melee-str range-str]

        result
      end
    end
  end
end
