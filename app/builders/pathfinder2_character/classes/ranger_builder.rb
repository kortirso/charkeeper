# frozen_string_literal: true

module Pathfinder2Character
  module Classes
    class RangerBuilder
      def call(result:)
        result[:main_ability] = 'dex' unless result[:main_ability]
        result[:abilities].merge!({ result[:main_ability].to_sym => 2 }) { |_, oldval, newval| oldval + newval }
        result[:skill_boosts].merge!({ nature: 1, survival: 1, free: 4 }) { |_, oldval, newval| oldval + newval }

        result[:weapon_skills] = { unarmed: 1, simple: 1, martial: 1, advanced: 0 }
        result[:armor_skills] = { unarmored: 1, light: 1, medium: 1, heavy: 0 }
        result[:saving_throws] = { fortitude: 2, reflex: 2, will: 1 }
        result[:perception] = 2
        result[:class_dc] = 1

        result
      end
    end
  end
end
