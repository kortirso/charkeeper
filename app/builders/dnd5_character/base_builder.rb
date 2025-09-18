# frozen_string_literal: true

module Dnd5Character
  class BaseBuilder
    def call(result:)
      result.merge({
        classes: { result[:main_class] => 1 },
        subclasses: { result[:main_class] => nil },
        weapon_core_skills: [],
        weapon_skills: [],
        armor_proficiency: [],
        languages: [],
        selected_skills: [],
        resistance: [],
        immunity: [],
        vulnerability: [],
        tools: [],
        hit_dice: { 6 => 0, 8 => 0, 10 => 0, 12 => 0 }
      })
    end
  end
end
