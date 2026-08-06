# frozen_string_literal: true

module NimbleCharacter
  module Classes
    class ShadowmancerBuilder
      def call(result:)
        result[:health] = { 'current' => 13, 'temp' => 0, 'max' => 13 }
        result[:weapons] = []

        result
      end
    end
  end
end
