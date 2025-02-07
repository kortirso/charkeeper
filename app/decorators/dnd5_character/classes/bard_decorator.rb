# frozen_string_literal: true

module Dnd5Character
  module Classes
    class BardDecorator
      WEAPON_CORE = ['light weapon'].freeze
      DEFAULT_WEAPON_SKILLS = %w[longsword shortsword rapier hand_crossbow].freeze
      ARMOR = ['light armor'].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 10, dex: 14, con: 11, int: 12, wis: 13, cha: 15 }
        result[:health] = { current: 8, max: 8, temp: 0 }

        result
      end

      # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/CyclomaticComplexity
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[dex cha] if result[:main_class] == 'bard'
        result[:spell_classes][:bard] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :cha),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :cha),
          cantrips_amount: cantrips_amount(class_level),
          spells_amount: spells_amount(class_level),
          max_spell_level: max_spell_level(class_level),
          prepared_spells_amount: spells_amount(class_level)
        }
        result[:spells_slots] = spells_slots(class_level)
        result[:hit_dice][8] += class_level

        result[:class_features] << {
          slug: 'bardic_inspiration',
          title: I18n.t('dnd5.class_features.bard.bardic_inspiration.title'),
          description: I18n.t(
            'dnd5.class_features.bard.bardic_inspiration.description',
            value: bardic_inspiration_dice(class_level)
          ),
          limit: bardic_inspiration_limit(result)
        }
        if class_level >= 2 # Jack of All Trades, 2 level
          result[:class_features] << {
            slug: 'jask_of_all_trades',
            title: I18n.t('dnd5.class_features.bard.jask_of_all_trades.title'),
            description: I18n.t(
              'dnd5.class_features.bard.jask_of_all_trades.description',
              value: result[:proficiency_bonus] / 2
            )
          }
        end
        if class_level >= 2 # Song of Rest, 2 level
          result[:class_features] << {
            slug: 'song_of_rest',
            title: I18n.t('dnd5.class_features.bard.song_of_rest.title'),
            description: I18n.t(
              'dnd5.class_features.bard.song_of_rest.description',
              value: song_of_rest_value(class_level)
            )
          }
        end

        result
      end

      private

      def cantrips_amount(class_level)
        return 4 if class_level >= 10
        return 3 if class_level >= 4

        2
      end

      def spells_amount(class_level)
        return 22 if class_level >= 18
        return 20 if class_level >= 17
        return 19 if class_level >= 15
        return 18 if class_level >= 14
        return 16 if class_level >= 13
        return 15 if class_level >= 11
        return 14 if class_level >= 10

        class_level + 3
      end
      # rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/CyclomaticComplexity

      def max_spell_level(class_level)
        ::Dnd5Character::ClassDecorateWrapper::SPELL_SLOTS[class_level].keys.max
      end

      def spells_slots(class_level)
        ::Dnd5Character::ClassDecorateWrapper::SPELL_SLOTS[class_level]
      end

      def bardic_inspiration_dice(class_level)
        return 'd12' if class_level >= 15
        return 'd10' if class_level >= 10
        return 'd8' if class_level >= 5

        'd6'
      end

      def bardic_inspiration_limit(result)
        [1, result.dig(:modifiers, :wis)].max
      end

      def song_of_rest_value(class_level)
        return '1d12' if class_level >= 17
        return '1d10' if class_level >= 13
        return '1d8' if class_level >= 9

        '1d6'
      end
    end
  end
end
