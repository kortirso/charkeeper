# frozen_string_literal: true

module DaggerheartCharacter
  class HeritageBuilder
    def call(result:)
      heritage_builder(result[:heritage]).call(result: result)
    end

    private

    def heritage_builder(heritage)
      Charkeeper::Container.resolve("builders.daggerheart_character.heritages.#{heritage}")
    end
  end
end
