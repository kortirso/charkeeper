# frozen_string_literal: true

module Dnd5
  module Classes
    class SorcererDecorator
      def decorate(result:, class_level:)
        result[:class_saving_throws] = %i[con cha] if result[:class_saving_throws].nil?
        result[:spell_classes] << 'sorcerer'

        result
      end
    end
  end
end
