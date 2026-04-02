# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class StormBuilder
      def call(result:)
        result[:skill_boosts].merge!({ acrobatics: 1 }) { |_, oldval, newval| oldval + newval }
        result[:feats] = result[:feats].push('storm_born').uniq
        result[:focus_spells] = result[:focus_spells].push('tempest_surge').uniq

        result
      end
    end
  end
end
