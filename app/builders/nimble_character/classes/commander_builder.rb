# frozen_string_literal: true

module NimbleCharacter
  module Classes
    class CommanderBuilder
      def call(result:)
        result[:health] = { 'current' => 17, 'temp' => 0, 'max' => 17 }
        result[:weapons] = %w[melee-str melee-dex]

        result
      end
    end
  end
end
