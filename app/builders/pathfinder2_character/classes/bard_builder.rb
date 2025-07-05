# frozen_string_literal: true

module Pathfinder2Character
  module Classes
    class BardBuilder
      # rubocop: disable Metrics/AbcSize
      def call(result:)
        result[:health] = { current: result[:health] + 8, max: result[:health] + 8, temp: 0 }
        result[:abilities].merge!({ cha: 2 }) { |_, oldval, newval| oldval + newval }
        result[:skill_boosts].merge!({ occultism: 1, performace: 1, free: 4 }) { |_, oldval, newval| oldval + newval }

        result[:weapon_skills] = { unarmed: 1, simple: 1, martial: 1, advanced: 0 }
        result[:armor_skills] = { unarmored: 1, light: 1, medium: 0, heavy: 0 }
        result[:saving_throws] = { fortitude: 1, reflex: 1, will: 2 }
        result[:perception] = 2
        result[:class_dc] = 1
        result[:spell_list] = 'occult'

        result
      end
      # rubocop: enable Metrics/AbcSize
    end
  end
end
