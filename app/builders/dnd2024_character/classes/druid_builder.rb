# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class DruidBuilder
      LANGUAGES = %w[druidic].freeze
      WEAPON_CORE = ['light'].freeze
      ARMOR = %w[light shield].freeze
      TOOLS = %w[herbalism].freeze

      def call(result:) # rubocop: disable Metrics/AbcSize
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:tools] = result[:tools].concat(TOOLS).uniq
        result[:abilities] = { str: 8, dex: 12, con: 14, int: 13, wis: 15, cha: 10 }
        result[:health] = { current: 10, max: 10, temp: 0 }
        result[:skill_boosts] += 2
        result[:skill_boosts_list] = %w[arcana animal insight medicine nature perception religion survival]

        result
      end
    end
  end
end
