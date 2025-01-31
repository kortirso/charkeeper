# frozen_string_literal: true

module Dnd5Character
  module Subclasses
    class AlchemistDecorator
      SPELLS = {
        3 => %w[healing_word ray_of_sickness],
        5 => %w[acid_arrow flaming_sphere],
        9 => %w[gaseous_form mass_healing_word]
      }.freeze

      # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
      def decorate_character_abilities(result:, class_level:)
        if class_level >= 3 # Experimental Elixir, 3 level
          result[:class_features] << {
            slug: 'experimental_elixir',
            title: I18n.t('dnd5.class_features.artificer.experimental_elixir.title'),
            description: I18n.t('dnd5.class_features.artificer.experimental_elixir.description'),
            limit: experimental_elixir_limit(class_level)
          }
        end
        if class_level >= 5 # Alchemical Savant
          result[:class_features] << {
            slug: 'alchemical_savant',
            title: I18n.t('dnd5.class_features.artificer.alchemical_savant.title'),
            description: I18n.t(
              'dnd5.class_features.artificer.alchemical_savant.description',
              value: result.dig(:modifiers, :int)
            )
          }
        end

        result[:static_spells].concat(SPELLS[3]) if class_level >= 3
        result[:static_spells].concat(SPELLS[5]) if class_level >= 5
        result[:static_spells].concat(SPELLS[9]) if class_level >= 9

        result
      end
      # rubocop: enable Metrics/MethodLength, Metrics/AbcSize

      private

      def experimental_elixir_limit(class_level)
        return 3 if class_level >= 15
        return 2 if class_level >= 6

        1
      end
    end
  end
end
