# frozen_string_literal: true

module Pathfinder2Character
  module Backgrounds
    class HerbalistBuilder
      def call(result:)
        result[:ability_boosts] = result[:ability_boosts].merge({ free: 1, con_wis: 1 }) { |_, oldval, newval| oldval + newval }
        if result[:selected_skills][:nature]
          result[:skill_boosts][:free] += 1
        else
          result[:selected_skills][:nature] = 1
        end
        result[:lore_skills][:lore1] = { name: 'Herbalism', level: 1 }

        result
      end
    end
  end
end
