# frozen_string_literal: true

module Dnd2024Character
  class SpeciesBuilder
    def call(result:)
      species_builder(result[:species]).call(result: result)
    end

    private

    def species_builder(species)
      "Dnd2024Character::Species::#{species.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
