# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class LeafBuilder
      def call(result:)
        result[:skill_boosts].merge!({ diplomacy: 1 }) { |_, oldval, newval| oldval + newval }
        result[:feats] = result[:feats].push('leshy_familiar').uniq
        result[:focus_spells] = result[:focus_spells].push('cornucopia').uniq

        result
      end
    end
  end
end
