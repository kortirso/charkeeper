# frozen_string_literal: true

module Dnd5Character
  module Classes
    class DruidDecorator
      # rubocop: disable Metrics/AbcSize
      def decorate(result:, class_level:)
        result[:class_save_dc] = %i[int wis] if result[:main_class] == 'druid'
        result[:spell_classes][:druid] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :wis),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :wis),
          cantrips_amount: cantrips_amount(class_level),
          max_spell_level: max_spell_level(class_level),
          prepared_spells_amount: [result.dig(:modifiers, :wis) + class_level, 1].max
        }
        result[:spells_slots] = spells_slots(class_level)

        if class_level >= 2 # Wild Shape, 2 level
          result[:class_features] << {
            title: I18n.t('dnd5.class_features.druid.wild_shape.title'),
            description: I18n.t('dnd5.class_features.druid.wild_shape.description', value: wild_shape_value(class_level))
          }
        end

        result
      end
      # rubocop: enable Metrics/AbcSize

      private

      def cantrips_amount(class_level)
        return 4 if class_level >= 10
        return 3 if class_level >= 4

        2
      end

      def max_spell_level(class_level)
        Dnd5::ClassDecorator::SPELL_SLOTS[class_level].keys.max
      end

      def spells_slots(class_level)
        Dnd5::ClassDecorator::SPELL_SLOTS[class_level]
      end

      def wild_shape_value(class_level)
        return 1 if class_level >= 8
        return 0.5 if class_level >= 4

        0.25
      end
    end
  end
end
