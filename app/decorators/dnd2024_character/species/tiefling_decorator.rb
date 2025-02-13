# frozen_string_literal: true

module Dnd2024Character
  module Species
    class TieflingDecorator
      def decorate_fresh_character(result:)
        result[:speed] = 30

        result
      end

      def decorate_character_abilities(result:)
        result[:darkvision] = 60

        result
      end
    end
  end
end
