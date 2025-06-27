# frozen_string_literal: true

module Dnd5Character
  module Classes
    class DruidBuilder
      LANGUAGES = %w[druidic].freeze
      DEFAULT_WEAPON_SKILLS = %w[quarterstaff mace dart club dagger spear javelin sling sickle scimitar].freeze
      ARMOR = %w[light medium shield].freeze

      def call(result:)
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:abilities] = { str: 11, dex: 13, con: 12, int: 14, wis: 15, cha: 10 }
        result[:health] = { current: 9, max: 9, temp: 0 }

        result
      end
    end
  end
end
