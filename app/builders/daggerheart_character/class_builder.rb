# frozen_string_literal: true

module DaggerheartCharacter
  class ClassBuilder
    def call(result:)
      class_builder(result[:main_class]).call(result: result)
    end

    private

    def class_builder(main_class)
      Charkeeper::Container.resolve("builders.daggerheart_character.classes.#{main_class}")
    end
  end
end
