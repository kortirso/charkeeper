# frozen_string_literal: true

module Dnd5Character
  module Subclasses
    class CircleOfTheLandDecorator
      LAND_SPELLS_3 = {
        'arctic' => ['Hold person', 'Spike growth'],
        'forest' => ['Barkskin', 'Spider Climb']
      }.freeze

      def decorate(result:, class_level:)
        result[:spell_classes][:druid][:cantrips_amount] += 1 if class_level >= 2

        if class_level >= 2 # Natural recovery, 2 level
          result[:class_features] << {
            slug: 'natural_recovery',
            title: I18n.t('dnd5.class_features.druid.natural_recovery.title'),
            description: I18n.t(
              'dnd5.class_features.druid.natural_recovery.description',
              value: natural_recovery_value(class_level)
            ),
            limit: 1
          }
        end

        selected_land = result.dig(:selected_features, 'land')
        result[:static_spells] << LAND_SPELLS_3[selected_land] if selected_land && class_level >= 3 # Circle spells, 3 level

        result
      end

      private

      def natural_recovery_value(class_level)
        (class_level / 2.0).round
      end
    end
  end
end
