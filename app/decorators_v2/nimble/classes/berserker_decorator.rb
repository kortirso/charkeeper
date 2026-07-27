# frozen_string_literal: true

module Nimble
  module Classes
    class BerserkerDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result
      end
    end
  end
end
