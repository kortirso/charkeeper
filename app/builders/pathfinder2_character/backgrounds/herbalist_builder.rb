# frozen_string_literal: true

module Pathfinder2Character
  module Backgrounds
    class HerbalistBuilder
      def call(result:)
        result[:ability_boosts].merge!({ free: 1, con_wis: 1 }) { |_, oldval, newval| oldval + newval }
        result[:skill_boosts].merge!({ nature: 1 }) { |_, oldval, newval| oldval + newval }
        result[:lore_skills][:lore1] = { name: 'Herbalism', level: 1 }

        result
      end
    end
  end
end
