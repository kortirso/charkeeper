# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class FaithFlamekeeperBuilder
      SPELL_LIST = 'divine'

      def call(result:)
        result[:skill_boosts].merge!({ religion: 1 }) { |_, oldval, newval| oldval + newval }
        result[:spell_list] = SPELL_LIST
        result[:focus_spells] = result[:focus_spells].push('stoke_the_heart').uniq
        result[:spells] = result[:spells].push('command').uniq

        result
      end
    end
  end
end
