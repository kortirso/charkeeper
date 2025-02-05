# frozen_string_literal: true

module Dnd5Character
  module Races
    class TieflingDecorator
      LANGUAGES = %w[common infernal].freeze
      RESISTANCES = %w[fire].freeze

      def decorate_fresh_character(result:)
        result[:speed] = 30
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:resistance] = result[:resistance].concat(RESISTANCES).uniq

        result
      end
    end
  end
end
