# frozen_string_literal: true

module FalloutCharacter
  class BaseBuilder
    def call(result:)
      result.merge({
        abilities: { 'str' => 5, 'per' => 5, 'end' => 5, 'cha' => 5, 'int' => 5, 'agi' => 5, 'lck' => 5 },
        max_abilities: {},
        tag_skills: [],
        tag_skill_boosts: 3,
        guide_step: result[:skip_guide] ? nil : 1
      }).except(:skip_guide)
    end
  end
end
