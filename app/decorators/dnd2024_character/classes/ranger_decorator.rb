# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class RangerDecorator
      WEAPON_CORE = ['light weapon', 'martial weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze
      SPELL_SLOTS = {
        1 => { 1 => 2 },
        2 => { 1 => 2 },
        3 => { 1 => 3 },
        4 => { 1 => 4, 2 => 2 },
        5 => { 1 => 4, 2 => 2 },
        6 => { 1 => 4, 2 => 3 },
        7 => { 1 => 4, 2 => 3 },
        8 => { 1 => 4, 2 => 3 },
        9 => { 1 => 4, 2 => 3, 3 => 2 },
        10 => { 1 => 4, 2 => 3, 3 => 2 },
        11 => { 1 => 4, 2 => 3, 3 => 3 },
        12 => { 1 => 4, 2 => 3, 3 => 3 },
        13 => { 1 => 4, 2 => 3, 3 => 3, 4 => 1 },
        14 => { 1 => 4, 2 => 3, 3 => 3, 4 => 1 },
        15 => { 1 => 4, 2 => 3, 3 => 3, 4 => 2 },
        16 => { 1 => 4, 2 => 3, 3 => 3, 4 => 2 },
        17 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 1 },
        18 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 1 },
        19 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2 },
        20 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2 }
      }.freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 15, dex: 14, con: 13, int: 12, wis: 11, cha: 10 }
        result[:health] = { current: 9, max: 9, temp: 0 }

        result
      end

      # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[str dex] if result[:main_class] == 'ranger'
        result[:spell_classes][:ranger] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :wis),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :wis),
          cantrips_amount: cantrips_amount(class_level),
          max_spell_level: max_spell_level(class_level),
          prepared_spells_amount: prepared_spells_amount(class_level)
        }
        result[:spells_slots] = spells_slots(class_level)
        result[:hit_dice][10] += class_level

        result
      end

      private

      def cantrips_amount(class_level)
        return 4 if class_level >= 14
        return 3 if class_level >= 10

        2
      end

      def prepared_spells_amount(class_level)
        return 15 if class_level >= 19
        return 14 if class_level >= 17
        return 12 if class_level >= 15
        return 11 if class_level >= 13
        return 10 if class_level >= 11
        return 9 if class_level >= 9
        return 7 if class_level >= 8
        return class_level if class_level >= 6

        class_level + 1
      end
      # rubocop: enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity

      def max_spell_level(class_level)
        SPELL_SLOTS[class_level].keys.max
      end

      def spells_slots(class_level)
        SPELL_SLOTS[class_level]
      end
    end
  end
end
