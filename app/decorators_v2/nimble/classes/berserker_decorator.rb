# frozen_string_literal: true

module Nimble
  module Classes
    class BerserkerDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['keys'] = %w[str dex]
        @result['hit_die'] = 12
        @result['saves'] = %w[str int]
        @result['armors'] = []
        @result['weapons'] = %w[melee-str range-str]
        @result
      end
    end
  end
end
