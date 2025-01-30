# frozen_string_literal: true

module Dnd5Character
  module Subclasses
    class CollegeOfWhispersDecorator
      def decorate_character_abilities(result:, class_level:)
        if class_level >= 3 # Words of terror, 3
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.bard.words_of_terror.title'),
            description: I18n.t(
              'dnd5.class_features.bard.words_of_terror.description',
              value: result.dig(:spell_classes, :bard, :save_dc)
            ),
            limit: 1
          }
        end
        if class_level >= 3 # Psychic blades, 3 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.bard.psychic_blades.title'),
            description: I18n.t(
              'dnd5.class_features.bard.psychic_blades.description',
              value: psychic_blades_value(class_level)
            )
          }
        end

        result
      end

      private

      def psychic_blades_value(class_level)
        return '8d6' if class_level >= 15
        return '5d6' if class_level >= 10
        return '3d6' if class_level >= 5

        '2d6'
      end
    end
  end
end
