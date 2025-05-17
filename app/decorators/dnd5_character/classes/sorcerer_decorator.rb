# frozen_string_literal: true

module Dnd5Character
  module Classes
    class SorcererDecorator
      DEFAULT_WEAPON_SKILLS = %w[quarterstaff dart dagger sling light_crossbow].freeze

      def decorate_fresh_character(result:)
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS).uniq
        result[:abilities] = { str: 10, dex: 11, con: 14, int: 13, wis: 12, cha: 15 }
        result[:health] = { current: 8, max: 8, temp: 0 }

        result
      end

      # rubocop: disable Metrics/AbcSize
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[con cha] if result[:main_class] == 'sorcerer'
        result[:spell_classes][:sorcerer] = {
          save_dc: 8 + result[:proficiency_bonus] + result.dig(:modifiers, :cha),
          attack_bonus: result[:proficiency_bonus] + result.dig(:modifiers, :cha),
          cantrips_amount: cantrips_amount(class_level),
          spells_amount: spells_amount(class_level),
          max_spell_level: max_spell_level(class_level),
          prepared_spells_amount: spells_amount(class_level)
        }
        result[:spells_slots] = spells_slots(class_level)

        result
      end
      # rubocop: enable Metrics/AbcSize

      private

      def cantrips_amount(class_level)
        return 6 if class_level >= 10
        return 5 if class_level >= 4

        4
      end

      def spells_amount(class_level)
        return 15 if class_level >= 17
        return 14 if class_level >= 15
        return 13 if class_level >= 13
        return 12 if class_level >= 11

        class_level + 1
      end

      def max_spell_level(class_level)
        ::Dnd5Character::ClassDecorateWrapper::SPELL_SLOTS[class_level].keys.max
      end

      def spells_slots(class_level)
        ::Dnd5Character::ClassDecorateWrapper::SPELL_SLOTS[class_level]
      end
    end
  end
end
