# frozen_string_literal: true

module NimbleCharacter
  module Classes
    class MageBuilder
      def call(result:)
        result[:health] = { 'current' => 10, 'temp' => 0, 'max' => 10 }
        result[:weapons] = []

        result
      end
    end
  end
end
