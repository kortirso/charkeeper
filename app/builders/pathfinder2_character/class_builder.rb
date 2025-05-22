# frozen_string_literal: true

module Pathfinder2Character
  class ClassBuilder
    def call(result:)
      class_builder(result[:main_class]).call(result: result)
    end

    private

    def class_builder(main_class)
      Charkeeper::Container.resolve("builders.pathfinder2_character.classes.#{main_class}")
    end
  end
end
