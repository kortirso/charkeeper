# frozen_string_literal: true

module Dnd5Character
  module Classes
    class ArtificerDecorator
      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze
      SPELL_SLOTS = {
        1 => { 1 => 2 },
        2 => { 1 => 2 },
        3 => { 1 => 3 },
        4 => { 1 => 3 },
        5 => { 1 => 4, 2 => 2 },
        6 => { 1 => 4, 2 => 2 },
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
        result[:abilities] = { str: 11, dex: 12, con: 14, int: 15, wis: 13, cha: 10 }
        result[:health] = { current: 10, max: 10, temp: 0 }

        result
      end

      # rubocop: disable Metrics/AbcSize
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[con int] if result[:main_class] == 'artificer'
        result[:spell_classes][:artificer] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :int),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :int),
          cantrips_amount: cantrips_amount(class_level),
          max_spell_level: max_spell_level(class_level),
          prepared_spells_amount: [result.dig(:modifiers, :int) + (class_level / 2), 1].max
        }
        result[:spells_slots] = spells_slots(class_level)
        result[:hit_dice][8] += class_level

        result
      end
      # rubocop: enable Metrics/AbcSize

      private

      def cantrips_amount(class_level)
        return 4 if class_level >= 14
        return 3 if class_level >= 10

        2
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
