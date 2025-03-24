# frozen_string_literal: true

module Pathfinder2Character
  class BaseDecorator
    def decorate_fresh_character(race:, main_class:, subrace: nil)
      {
        race: race,
        subrace: subrace,
        main_class: main_class,
        classes: { main_class => 1 },
        languages: []
      }.compact
    end

    def decorate_character_abilities(character:)
      data = character.data

      {
        race: data.race,
        subrace: data.subrace,
        main_class: data.main_class,
        classes: data.classes,
        overall_level: data.level,
        languages: data.languages,
        health: data.health,
        abilities: data.abilities,
        modifiers: modifiers(data)
      }.compact
    end

    private

    def modifiers(data)
      data.abilities.transform_values { |value| calc_ability_modifier(value) }.symbolize_keys
    end

    def calc_ability_modifier(value)
      (value / 2) - 5
    end
  end
end
