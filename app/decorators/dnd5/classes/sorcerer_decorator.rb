# frozen_string_literal: true

module Dnd5
  module Classes
    class SorcererDecorator
      def decorate(result:, class_level:)
        result[:class_save_dc] = %i[con cha] if result[:class_save_dc].nil?
        result[:spell_classes] << 'sorcerer'

        result
      end
    end
  end
end
