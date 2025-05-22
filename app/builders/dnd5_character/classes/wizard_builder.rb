# frozen_string_literal: true

module Dnd5Character
  module Classes
    class WizardBuilder
      DEFAULT_WEAPON_SKILLS = %w[quarterstaff dart dagger sling light_crossbow].freeze

      def call(result:)
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS).uniq
        result[:abilities] = { str: 10, dex: 12, con: 11, int: 15, wis: 14, cha: 13 }
        result[:health] = { current: 6, max: 6, temp: 0 }
        result[:hit_dice][6] = 1

        result
      end
    end
  end
end
