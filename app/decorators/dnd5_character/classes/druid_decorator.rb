# frozen_string_literal: true

module Dnd5Character
  module Classes
    class DruidDecorator
      LANGUAGES = %w[druidic].freeze
      DEFAULT_WEAPON_SKILLS = %w[quarterstaff mace dart club dagger spear javelin sling sickle scimitar].freeze
      ARMOR = ['light armor', 'medium armor', 'shield'].freeze

      def decorate_fresh_character(result:)
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
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
          prepared_spells_amount: [result.dig(:modifiers, :wis) + class_level, 1].max
        }
        result[:spells_slots] = spells_slots(class_level)

        result
      end

      private

      def cantrips_amount(class_level)
        return 4 if class_level >= 10
        return 3 if class_level >= 4

        2
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
