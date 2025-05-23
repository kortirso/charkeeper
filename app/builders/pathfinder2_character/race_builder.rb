# frozen_string_literal: true

module Pathfinder2Character
  class RaceBuilder
    def call(result:)
      race_builder(result[:race]).call(result: result)
    end

    private

    def race_builder(race)
      Charkeeper::Container.resolve("builders.pathfinder2_character.races.#{race}")
    end
  end
end
