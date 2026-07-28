# frozen_string_literal: true

module Nimble
  module Classes
    class CheatDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['keys'] = %w[dex int]
        @result['hit_die'] = 6
        @result['saves'] = %w[dex wil]
        @result['armors'] = %w[leather]
        @result
      end
    end
  end
end
