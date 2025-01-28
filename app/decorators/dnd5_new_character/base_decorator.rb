# frozen_string_literal: true

module Dnd5NewCharacter
  class BaseDecorator
    extend Dry::Initializer

    option :race
    option :subrace, optional: true
    option :main_class

    def decorate
      {
        race: race,
        subrace: subrace,
        main_class: main_class,
        weapon_core_skills: [],
        weapon_skills: [],
        armor_proficiency: [],
        languages: [],
        selected_skills: []
      }.compact
    end
  end
end
