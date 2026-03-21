# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class CollegeOfValorDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        @result['attacks_per_action'] = 2 if class_level >= 6
        @result
      end

      private

      def class_level
        classes['bard']
      end
    end
  end
end
