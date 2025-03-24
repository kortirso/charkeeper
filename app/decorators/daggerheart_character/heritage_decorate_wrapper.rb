# frozen_string_literal: true

module DaggerheartCharacter
  class HeritageDecorateWrapper
    def decorate_fresh_character(result:)
      heritage_decorator(result[:heritage]).decorate_fresh_character(result: result)
    end

    def decorate_character_abilities(result:)
      heritage_decorator(result[:heritage]).decorate_character_abilities(result: result)
    end

    private

    def heritage_decorator(heritage)
      Charkeeper::Container.resolve("decorators.daggerheart_character.heritages.#{heritage}")
    rescue Dry::Container::KeyError => _e
      Charkeeper::Container.resolve('decorators.dummy_decorator')
    end
  end
end
