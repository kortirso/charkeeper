# frozen_string_literal: true

module Pathfinder2Character
  class RaceDecorateWrapper
    def decorate_fresh_character(result:)
      race_decorator(result[:race]).decorate_fresh_character(result: result)
    end

    def decorate_character_abilities(result:)
      race_decorator(result[:race]).decorate_character_abilities(result: result)
    end

    private

    def race_decorator(race)
      Charkeeper::Container.resolve("decorators.pathfinder2_character.races.#{race}")
    rescue Dry::Container::KeyError => _e
      Charkeeper::Container.resolve('decorators.dummy_decorator')
    end
  end
end
