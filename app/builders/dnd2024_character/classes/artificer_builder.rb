# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class ArtificerBuilder
      WEAPON_CORE = ['light'].freeze
      ARMOR = %w[light medium shield].freeze
      TOOLS = %w[thieves tinker].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:tools] = result[:tools].concat(TOOLS).uniq
        result[:abilities] = { str: 10, dex: 12, con: 14, int: 15, wis: 13, cha: 8 }
        result[:health] = { current: 10, max: 10, temp: 0 }
        result[:skill_boosts] += 2
        result[:skill_boosts_list] = %w[arcana history insight medicine nature perception sleight]

        result
      end
    end
  end
end
