# frozen_string_literal: true

module Nimble
  module Classes
    class CommanderDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['keys'] = %w[str int]
        @result['hit_die'] = 10
        @result['saves'] = %w[str dex]
        @result['armors'] = %w[mail shield]
        @result
      end
    end
  end
end
