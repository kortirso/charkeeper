# frozen_string_literal: true

module Dnd5Character
  class ClassBuilder
    def call(result:)
      class_builder(result[:main_class]).call(result: result)
    end

    private

    def class_builder(main_class)
      Charkeeper::Container.resolve("builders.dnd5_character.classes.#{main_class}")
    end
  end
end
