# frozen_string_literal: true

module Pathfinder2Character
  module Classes
    class FighterBuilder
      # rubocop: disable Metrics/AbcSize
      def call(result:)
        result[:main_ability] = 'str' unless result[:main_ability]
        result[:health] = { current: result[:health] + 10, max: result[:health] + 10, temp: 0 }
        result[:abilities].merge!({ result[:main_ability].to_sym => 2 }) { |_, oldval, newval| oldval + newval }
        result[:skill_boosts].merge!({ acrobatics_athletics: 1, free: 3 }) { |_, oldval, newval| oldval + newval }

        result[:weapon_skills] = { unarmed: 2, simple: 2, martial: 2, advanced: 1 }
        result[:armor_skills] = { unarmored: 1, light: 1, medium: 1, heavy: 1 }
        result[:saving_throws] = { fortitude: 2, reflex: 2, will: 1 }
        result[:perception] = 2
        result[:class_dc] = 1
        result[:feats] = result[:feats].push('shield_block').uniq

        result
      end
      # rubocop: enable Metrics/AbcSize
    end
  end
end
