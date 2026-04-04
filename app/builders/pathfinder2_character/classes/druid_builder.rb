# frozen_string_literal: true

module Pathfinder2Character
  module Classes
    class DruidBuilder
      # rubocop: disable Metrics/AbcSize
      def call(result:)
        result[:abilities].merge!({ wis: 2 }) { |_, oldval, newval| oldval + newval }
        result[:skill_boosts].merge!({ nature: 1, free: 2 }) { |_, oldval, newval| oldval + newval }

        result[:weapon_skills] = { unarmed: 1, simple: 1, martial: 0, advanced: 0 }
        result[:armor_skills] = { unarmored: 1, light: 1, medium: 1, heavy: 0 }
        result[:saving_throws] = { fortitude: 1, reflex: 1, will: 2 }
        result[:perception] = 1
        result[:class_dc] = 1
        result[:spell_dc] = 1
        result[:spell_attack] = 1
        result[:spell_list] = 'primal'
        result[:main_ability] = 'wis'
        result[:feats] = result[:feats].push('shield_block').uniq

        result
      end
      # rubocop: enable Metrics/AbcSize
    end
  end
end
