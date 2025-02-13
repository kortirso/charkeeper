# frozen_string_literal: true

module Dnd5Character
  module Subclasses
    class AlchemistDecorator
      SPELLS = {
        3 => %w[healing_word ray_of_sickness],
        5 => %w[acid_arrow flaming_sphere],
        9 => %w[gaseous_form mass_healing_word]
      }.freeze

      def decorate_character_abilities(result:, class_level:) # rubocop: disable Lint/UnusedMethodArgument
        # result[:static_spells].concat(SPELLS[3]) if class_level >= 3
        # result[:static_spells].concat(SPELLS[5]) if class_level >= 5
        # result[:static_spells].concat(SPELLS[9]) if class_level >= 9

        result
      end
    end
  end
end
