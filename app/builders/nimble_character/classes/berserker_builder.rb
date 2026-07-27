# frozen_string_literal: true

module NimbleCharacter
  module Classes
    class BerserkerBuilder
      def call(result:)
        result[:health] = { 'current' => 20, 'temp' => 0, 'max' => 20 }
        result[:weapons] = %w[melee-str range-str]

        result
      end
    end
  end
end
