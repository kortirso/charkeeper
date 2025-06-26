# frozen_string_literal: true

module Pathfinder2Character
  class BaseBuilder
    def call(result:)
      result.merge({
        classes: { result[:main_class] => 1 },
        subclasses: { result[:main_class] => result[:subclass] },
        languages: '',
        abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        selected_skills: {},
        lore_skills: { lore1: { name: 'Unknown', level: 0 }, lore2: { name: 'Unknown', level: 0 } },
        ability_boosts: { free: 4 },
        skill_boosts: { free: 0 }
      })
    end
  end
end
