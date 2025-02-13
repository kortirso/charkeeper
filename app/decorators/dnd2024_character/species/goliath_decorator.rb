# frozen_string_literal: true

module Dnd2024Character
  module Species
    class GoliathDecorator
      def decorate_fresh_character(result:)
        result[:speed] = 35

        result
      end

      def decorate_character_abilities(result:)
        result
      end
    end
  end
end
