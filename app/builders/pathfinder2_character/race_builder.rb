# frozen_string_literal: true

module Pathfinder2Character
  class RaceBuilder
    def call(result:)
      race_builder(result[:race]).call(result: result)
    end

    private

    def race_builder(race)
      "Pathfinder2Character::Races::#{race.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
