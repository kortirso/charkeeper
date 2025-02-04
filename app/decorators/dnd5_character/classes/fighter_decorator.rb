# frozen_string_literal: true

module Dnd5Character
  module Classes
    class FighterDecorator
      WEAPON_CORE = ['light weapon', 'martial weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'heavy armor', 'shield'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 15, dex: 13, con: 14, int: 10, wis: 11, cha: 12 }
        result[:health] = { current: 12, max: 12, temp: 0 }

        result
      end

      # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[str con] if result[:main_class] == 'fighter'

        result[:class_features] << {
          slug: 'second_wind',
          title: I18n.t('dnd5.class_features.fighter.second_wind.title'),
          description: I18n.t('dnd5.class_features.fighter.second_wind.description', value: "1d10+#{class_level}"),
          limit: 1
        }
        if class_level >= 2 # Action surge, 2 level
          result[:class_features] << {
            slug: 'action_surge',
            title: I18n.t('dnd5.class_features.fighter.action_surge.title'),
            description: I18n.t('dnd5.class_features.fighter.action_surge.description'),
            limit: class_level >= 17 ? 2 : 1
          }
        end
        result[:combat][:attacks_per_action] = attacks_per_action(class_level) # Extra Attack, 5 level
        if class_level >= 9 # Indomitable, 9 level
          result[:class_features] << {
            slug: 'indomitable',
            title: I18n.t('dnd5.class_features.fighter.indomitable.title'),
            description: I18n.t('dnd5.class_features.fighter.indomitable.description'),
            limit: indomitable_limit(class_level)
          }
        end

        result
      end
      # rubocop: enable Metrics/MethodLength, Metrics/AbcSize

      private

      def attacks_per_action(class_level)
        return 4 if class_level == 20
        return 3 if class_level >= 11
        return 2 if class_level >= 5

        1
      end

      def indomitable_limit(class_level)
        return 3 if class_level >= 17
        return 2 if class_level >= 13

        1
      end
    end
  end
end
