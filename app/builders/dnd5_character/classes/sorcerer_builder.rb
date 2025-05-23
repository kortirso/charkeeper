# frozen_string_literal: true

module Dnd5Character
  module Classes
    class SorcererBuilder
      DEFAULT_WEAPON_SKILLS = %w[quarterstaff dart dagger sling light_crossbow].freeze

      def call(result:)
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS).uniq
        result[:abilities] = { str: 10, dex: 11, con: 14, int: 13, wis: 12, cha: 15 }
        result[:health] = { current: 8, max: 8, temp: 0 }

        result
      end
    end
  end
end
