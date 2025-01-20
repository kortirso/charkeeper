# frozen_string_literal: true

module Dnd5
  module Classes
    class FighterDecorator
      def decorate(result:, class_level:)
        result[:class_save_dc] = %i[str con] if result[:class_save_dc].nil?

        result
      end
    end
  end
end
