# frozen_string_literal: true

module Dnd5Character
  module Races
    class DragonbornDecorator
      LANGUAGES = %w[common draconic].freeze

      def decorate_fresh_character(result:)
        result[:speed] = 30
        result[:languages] = result[:languages].concat(LANGUAGES).uniq

        result
      end
    end
  end
end
