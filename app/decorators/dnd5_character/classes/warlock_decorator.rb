# frozen_string_literal: true

module Dnd5Character
  module Classes
    class WarlockDecorator
      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor'].freeze
      SPELL_SLOTS = {
        1 => { 1 => 1 },
        2 => { 1 => 2 },
        3 => { 2 => 2 },
        4 => { 2 => 2 },
        5 => { 3 => 2 },
        6 => { 3 => 2 },
        7 => { 4 => 2 },
        8 => { 4 => 2 },
        9 => { 5 => 2 },
        10 => { 5 => 2 },
        11 => { 5 => 3 },
        12 => { 5 => 3 },
        13 => { 5 => 3 },
        14 => { 5 => 3 },
        15 => { 5 => 3 },
        16 => { 5 => 3 },
        17 => { 5 => 4 },
        18 => { 5 => 4 },
        19 => { 5 => 4 },
        20 => { 5 => 4 }
      }.freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 10, dex: 12, con: 11, int: 13, wis: 15, cha: 14 }
        result[:health] = { current: 8, max: 8, temp: 0 }

        result
      end

      # rubocop: disable Metrics/AbcSize
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[wis cha] if result[:main_class] == 'warlock'
        result[:spell_classes][:warlock] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :cha),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :cha),
          cantrips_amount: cantrips_amount(class_level),
          spells_amount: spells_amount(class_level),
          max_spell_level: max_spell_level(class_level),
          prepared_spells_amount: spells_amount(class_level)
        }
        result[:spells_slots] = spells_slots(class_level)
        result[:hit_dice][8] += class_level

        result
      end
      # rubocop: enable Metrics/AbcSize

      private

      def cantrips_amount(class_level)
        return 4 if class_level >= 10
        return 3 if class_level >= 4

        2
      end

      def spells_amount(class_level)
        return class_level + 1 if class_level < 9

        10 + ((class_level - 9) / 2)
      end

      def max_spell_level(class_level)
        SPELL_SLOTS[class_level].keys.max
      end

      def spells_slots(class_level)
        SPELL_SLOTS[class_level]
      end
    end
  end
end
