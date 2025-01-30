# frozen_string_literal: true

module Dnd5Character
  module Subclasses
    class ChampionDecorator
      # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
      def decorate_character_abilities(result:, class_level:)
        if class_level >= 3 && class_level < 15 # Improved critical, 3-14 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.fighter.improved_critical.title'),
            description: I18n.t('dnd5.class_features.fighter.improved_critical.description')
          }
        end
        if class_level >= 7 # Remarkable athlete, 7 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.fighter.remarkable_athlete.title'),
            description: I18n.t(
              'dnd5.class_features.fighter.remarkable_athlete.description',
              value: (result[:proficiency_bonus] / 2.0).round,
              distance: result.dig(:modifiers, 'str')
            )
          }
        end
        if class_level >= 15 # Superior critical, 15 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.fighter.superiod_critical.title'),
            description: I18n.t('dnd5.class_features.fighter.superiod_critical.description')
          }
        end
        if class_level >= 18 # Survivor, 18 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.fighter.survivor.title'),
            description: I18n.t(
              'dnd5.class_features.fighter.survivor.description',
              value: 5 + result.dig(:modifiers, 'con')
            )
          }
        end

        result
      end
      # rubocop: enable Metrics/MethodLength, Metrics/AbcSize
    end
  end
end
