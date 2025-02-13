# frozen_string_literal: true

module Dnd5Character
  module Subclasses
    class AlchemistDecorator
      SPELLS = {
        3 => %w[healing_word ray_of_sickness],
        5 => %w[melf_acid_arrow flaming_sphere],
        9 => %w[gaseous_form mass_healing_word]
      }.freeze

      def decorate_character_abilities(result:, class_level:)
        result[:static_spells].merge!(SPELLS[3].index_with { {} }) if class_level >= 3
        result[:static_spells].merge!(SPELLS[5].index_with { {} }) if class_level >= 5
        result[:static_spells].merge!(SPELLS[9].index_with { {} }) if class_level >= 9

        result
      end
    end
  end
end
