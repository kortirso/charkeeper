# frozen_string_literal: true

module FalloutCharacter
  module Origins
    class MutantBuilder
      def call(result:)
        result[:attributes] = { 'str' => 7, 'per' => 5, 'end' => 7, 'cha' => 5, 'int' => 5, 'agi' => 5, 'lck' => 5 }
        result[:max_attributes] = { 'str' => 12, 'end' => 12, 'cha' => 6, 'int' => 6 }

        result
      end
    end
  end
end
