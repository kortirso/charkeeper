# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class DruidDecorator
      LANGUAGES = %w[druidic].freeze
      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor', 'shield'].freeze
      TOOLS = %w[herbalism].freeze

      # rubocop: disable Metrics/AbcSize
      def decorate_fresh_character(result:)
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:tools] = result[:tools].concat(TOOLS).uniq
        result[:abilities] = { str: 11, dex: 13, con: 12, int: 14, wis: 15, cha: 10 }
        result[:health] = { current: 9, max: 9, temp: 0 }

        result
      end

      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[int wis] if result[:main_class] == 'druid'
        result[:spell_classes][:druid] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :wis),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :wis),
          cantrips_amount: cantrips_amount(class_level),
          max_spell_level: max_spell_level(class_level),
          prepared_spells_amount: prepared_spells_amount(class_level)
        }
        result[:spells_slots] = spells_slots(class_level)
        result[:hit_dice][8] += class_level

        result
      end

      private

      def cantrips_amount(class_level)
        return 4 if class_level >= 17
        return 3 if class_level >= 4

        2
      end

      def prepared_spells_amount(class_level)
        return class_level + 2 if class_level >= 16
        return class_level + 3 if class_level >= 14
        return class_level + 4 if class_level >= 12
        return class_level + 5 if class_level >= 9
        return class_level + 4 if class_level >= 5

        class_level + 3
      end
      # rubocop: enable Metrics/AbcSize

      def max_spell_level(class_level)
        ::Dnd2024Character::ClassDecorateWrapper::SPELL_SLOTS[class_level].keys.max
      end

      def spells_slots(class_level)
        ::Dnd2024Character::ClassDecorateWrapper::SPELL_SLOTS[class_level]
      end
    end
  end
end
