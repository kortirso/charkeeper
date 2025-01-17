# frozen_string_literal: true

module Dnd5
  module Classes
    class FighterDecorator
      def decorate(result:, class_level:)
        result[:class_saving_throws] = %i[str con] if result[:class_saving_throws].nil?

        result
      end
    end
  end
end
