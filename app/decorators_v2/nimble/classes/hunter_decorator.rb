# frozen_string_literal: true

module Nimble
  module Classes
    class HunterDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['keys'] = %w[dex wil]
        @result['hit_die'] = 8
        @result['saves'] = %w[dex int]
        @result['armors'] = %w[leather]
        @result
      end
    end
  end
end
