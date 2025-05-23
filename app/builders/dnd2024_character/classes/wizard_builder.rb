# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class WizardBuilder
      WEAPON_CORE = ['light weapon'].freeze

      def call(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:abilities] = { str: 10, dex: 12, con: 11, int: 15, wis: 14, cha: 13 }
        result[:health] = { current: 6, max: 6, temp: 0 }
        result[:hit_dice][6] = 1

        result
      end
    end
  end
end
