# frozen_string_literal: true

module Dnd2024Character
  class BaseBuilder
    def call(result:)
      result.merge({
        classes: { result[:main_class] => 1 },
        subclasses: { result[:main_class] => nil },
        weapon_core_skills: [],
        weapon_skills: [],
        armor_proficiency: [],
        languages: [],
        selected_skills: {},
        resistance: [],
        immunity: [],
        vulnerability: [],
        tools: [],
        hit_dice: { 6 => 0, 8 => 0, 10 => 0, 12 => 0 },
        guide_step: result[:skip_guide] ? nil : 1,
        skill_boosts: 0,
        any_skill_boosts: 0
      }).except(:skip_guide)
    end
  end
end
