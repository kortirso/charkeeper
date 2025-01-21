# frozen_string_literal: true

module Dnd5
  module Classes
    class SorcererDecorator
      def decorate(result:, class_level:)
        result[:max_energy] = class_level if class_level >= 2
        result[:class_save_dc] = %i[con cha] if result[:class_save_dc].nil?
        result[:spell_classes][:sorcerer] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :cha),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :cha)
        }

        result
      end
    end
  end
end
