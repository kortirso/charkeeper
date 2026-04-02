# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class SilenceInSnowBuilder
      def call(result:)
        result[:skill_boosts].merge!({ nature: 1 }) { |_, oldval, newval| oldval + newval }
        result[:spell_list] = 'primal'
        result[:focus_spells] = result[:focus_spells].push('clinging_ice').uniq
        result[:spells] = result[:spells].push('gust_of_wind').uniq

        result
      end
    end
  end
end
