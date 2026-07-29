# frozen_string_literal: true

module NimbleCharacter
  module Classes
    class HunterBuilder
      def call(result:)
        result[:health] = { 'current' => 13, 'temp' => 0, 'max' => 13 }
        result[:weapons] = %w[melee-dex range-dex]

        result
      end
    end
  end
end
