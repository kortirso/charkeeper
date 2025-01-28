# frozen_string_literal: true

module Dnd5Character
  module Classes
    class FighterDecorator
      def decorate(result:, class_level:) # rubocop: disable Lint/UnusedMethodArgument
        result[:class_save_dc] = %i[str con] if result[:main_class] == 'fighter'

        result
      end
    end
  end
end
