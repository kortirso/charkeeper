# frozen_string_literal: true

module Pathfinder2Character
  module Backgrounds
    class HermitBuilder
      def call(result:)
        result[:ability_boosts] = result[:ability_boosts].merge({ free: 1, con_int: 1 }) { |_, oldval, newval| oldval + newval }
        result[:skill_boosts][:nature_occultism] = 1
        result[:lore_skills][:lore1] = { name: 'Terrain', level: 1 }

        result
      end
    end
  end
end
