# frozen_string_literal: true

module Dnd5Character
  module Subclasses
    class CircleOfTheLandDecorator
      LAND_SPELLS_3 = {
        'arctic' => %w[hold_person spike_growth],
        'forest' => %w[barkskin spider_climb]
      }.freeze

      def decorate_character_abilities(result:, class_level:)
        result[:spell_classes][:druid][:cantrips_amount] += 1 if class_level >= 2

        selected_land = result.dig(:selected_features, 'land')
        result[:static_spells].concat(LAND_SPELLS_3[selected_land]) if selected_land && class_level >= 3 # Circle spells, 3 level

        result
      end
    end
  end
end
