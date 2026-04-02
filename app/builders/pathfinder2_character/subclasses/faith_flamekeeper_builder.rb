# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class FaithFlamekeeperBuilder
      def call(result:)
        result[:skill_boosts].merge!({ religion: 1 }) { |_, oldval, newval| oldval + newval }
        result[:spell_list] = 'divine'
        result[:focus_spells] = result[:focus_spells].push('stoke_the_heart').uniq
        result[:spells] = result[:spells].push('command').uniq

        result
      end
    end
  end
end
