# frozen_string_literal: true

module Dnd5Character
  module Classes
    class MonkBuilder
      WEAPON_CORE = ['light weapon'].freeze
      DEFAULT_WEAPON_SKILLS = %w[shortsword].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS).uniq
        result[:abilities] = { str: 12, dex: 15, con: 13, int: 11, wis: 14, cha: 10 }
        result[:health] = { current: 9, max: 9, temp: 0 }
        result[:hit_dice][8] = 1

        result
      end
    end
  end
end
