# frozen_string_literal: true

module Dnd2024Character
  module Species
    class DwarfDecorator
      RESISTANCES = %w[poison].freeze

      def decorate_fresh_character(result:)
        result[:speed] = 30
        result[:resistance] = result[:resistance].concat(RESISTANCES).uniq

        result
      end

      def decorate_character_abilities(result:)
        result[:darkvision] = 120

        result
      end
    end
  end
end
