# frozen_string_literal: true

module Dnd5
  module Classes
    class DummyDecorator
      def decorate(result:, class_level:) # rubocop: disable Lint/UnusedMethodArgument
        result
      end
    end
  end
end
