# frozen_string_literal: true

module Dnd5Character
  class RaceDecorateWrapper
    def decorate_fresh_character(result:)
      race_decorator(result[:race]).decorate_fresh_character(result: result)
    end

    def decorate_character_abilities(result:)
      race_decorator(result[:race]).decorate_character_abilities(result: result)
    end

    private

    def race_decorator(race)
      Charkeeper::Container.resolve("decorators.dnd5_character.races.#{race}")
    end
  end
end
