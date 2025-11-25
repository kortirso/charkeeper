# frozen_string_literal: true

module DaggerheartCharacter
  class ClassBuilder
    def call(result:)
      class_builder(result[:main_class]).call(result: result)
    end

    def equip(character:)
      class_builder(character.data.main_class).equip(character: character)

      Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'torch'), state: 'backpack')
      Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'rope'), state: 'backpack')
      Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'tent'), state: 'backpack')
      Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'bedroll'), state: 'backpack')
    end

    private

    def class_builder(main_class)
      return DaggerheartCharacter::Classes::HomebrewBuilder.new(id: main_class) if uuid?(main_class)

      "DaggerheartCharacter::Classes::#{main_class.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end

    def uuid?(string)
      uuid_regex = /\A[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\z/
      string.match?(uuid_regex)
    end
  end
end
