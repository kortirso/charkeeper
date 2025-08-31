# frozen_string_literal: true

module CharactersContext
  class GenerateJsonCharacterSheet
    def call(character:)
      case character.class.name
      when 'Daggerheart::Character' then daggerheart_json(character)
      end
    end

    private

    def daggerheart_json(character)
      CharactersContext::Daggerheart::GenerateJsonCharacterSheet.new.to_json(
        character: character
      )
    end
  end
end
