# frozen_string_literal: true

module Nimble
  module Classes
    class ZephyrDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['keys'] = %w[dex str]
        @result['hit_die'] = 8
        @result['saves'] = %w[dex int]
        @result['armors'] = []
        @result
      end
    end
  end
end
