# frozen_string_literal: true

module Pathfinder2Character
  module Classes
    class WitchBuilder
      def call(result:)
        result[:health] = { current: result[:health] + 6, max: result[:health] + 6, temp: 0 }
        result[:abilities] = result[:abilities].merge({ int: 2 }) { |_, oldval, newval| oldval + newval }
        result[:skill_boosts][:free] += 3

        result[:weapon_skills] = { unarmed: 1, simple: 1, martial: 0, advanced: 0 }
        result[:armor_skills] = { unarmored: 1, light: 0, medium: 0, heavy: 0 }
        result[:saving_throws] = { fortitude: 1, reflex: 1, will: 2 }
        result[:perception] = 1
        result[:class_dc] = 1

        result
      end
    end
  end
end
