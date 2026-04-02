# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class SpinnerOfThreadsBuilder
      def call(result:)
        result[:skill_boosts].merge!({ occultism: 1 }) { |_, oldval, newval| oldval + newval }
        result[:spell_list] = 'occult'
        result[:focus_spells] = result[:focus_spells].push('nudge_fate').uniq
        result[:spells] = result[:spells].push('sure_strike').uniq

        result
      end
    end
  end
end
