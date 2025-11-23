# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class RogueBuilder
      WEAPON_CORE = ['light'].freeze
      ARMOR = ['light'].freeze
      TOOLS = %w[thieves].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:tools] = result[:tools].concat(TOOLS).uniq
        result[:abilities] = { str: 12, dex: 15, con: 13, int: 14, wis: 10, cha: 8 }
        result[:health] = { current: 9, max: 9, temp: 0 }
        result[:skill_boosts] += 4
        result[:skill_boosts_list] =
          %w[acrobatics athletics deception insight intimidation investigation perception persuasion sleight stealth]

        result
      end
    end
  end
end
