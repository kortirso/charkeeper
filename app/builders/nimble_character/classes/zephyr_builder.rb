# frozen_string_literal: true

module NimbleCharacter
  module Classes
    class ZephyrBuilder
      def call(result:)
        result[:health] = { 'current' => 13, 'temp' => 0, 'max' => 13 }
        result[:weapons] = %w[melee-str melee-dex]

        result
      end
    end
  end
end
