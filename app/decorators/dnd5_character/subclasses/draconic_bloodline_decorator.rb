# frozen_string_literal: true

module Dnd5Character
  module Subclasses
    class DraconicBloodlineDecorator
      def decorate_character_abilities(result:, class_level:) # rubocop: disable Lint/UnusedMethodArgument
        if result.dig(:defense_gear, :armor).nil?
          result[:combat][:armor_class] = [result[:combat][:armor_class], modified_armor_class(result)].max
        end

        result
      end

      private

      def modified_armor_class(result)
        13 + result.dig(:modifiers, :dex) + result.dig(:defense_gear, :shield, :items_data, 'info', 'ac').to_i
      end
    end
  end
end
