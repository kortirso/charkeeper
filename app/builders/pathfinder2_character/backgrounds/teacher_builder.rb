# frozen_string_literal: true

module Pathfinder2Character
  module Backgrounds
    class TeacherBuilder
      def call(result:)
        result[:ability_boosts] = result[:ability_boosts].merge({ free: 1, int_wis: 1 }) { |_, oldval, newval| oldval + newval }
        result[:skill_boosts][:performance_society] = 1
        result[:lore_skills][:lore1] = { name: 'Academia', level: 1 }

        result
      end
    end
  end
end
