# frozen_string_literal: true

module DaggerheartCharacter
  class ClassBuilder
    include Deps[item_add: 'commands.characters_context.items.add']

    def call(result:)
      class_builder(result[:main_class]).call(result: result)
    end

    def equip(character:)
      class_builder(character.data.main_class).equip(character: character)

      item_add.call(character: character, item: Daggerheart::Item.find_by(slug: 'torch'), state: 'backpack')
      item_add.call(character: character, item: Daggerheart::Item.find_by(slug: 'rope'), state: 'backpack')
      item_add.call(character: character, item: Daggerheart::Item.find_by(slug: 'tent'), state: 'backpack')
      item_add.call(character: character, item: Daggerheart::Item.find_by(slug: 'bedroll'), state: 'backpack')
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
