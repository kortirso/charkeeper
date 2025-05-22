# frozen_string_literal: true

module Dnd2024Character
  class SpeciesBuilder
    def call(result:)
      species_builder(result[:species]).call(result: result)
    end

    private

    def species_builder(species)
      Charkeeper::Container.resolve("builders.dnd2024_character.species.#{species}")
    end
  end
end
