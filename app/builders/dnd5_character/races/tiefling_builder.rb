# frozen_string_literal: true

module Dnd5Character
  module Races
    class TieflingBuilder
      LANGUAGES = %w[common infernal].freeze
      RESISTANCES = %w[fire].freeze

      def call(result:)
        result[:speed] = 30
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:resistance] = result[:resistance].concat(RESISTANCES).uniq

        result
      end
    end
  end
end
