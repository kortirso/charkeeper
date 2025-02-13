# frozen_string_literal: true

module Dnd2024Character
  class SpeciesDecorateWrapper
    def decorate_fresh_character(result:)
      species_decorator(result[:species]).decorate_fresh_character(result: result)
    end

    def decorate_character_abilities(result:)
      species_decorator(result[:species]).decorate_character_abilities(result: result)
    end

    private

    def species_decorator(species)
      Charkeeper::Container.resolve("decorators.dnd2024_character.species.#{species}")
    end
  end
end
