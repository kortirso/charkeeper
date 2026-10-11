# frozen_string_literal: true

module Pathfinder2Character
  class ClassBuilder
    def call(result:)
      class_builder(result[:main_class]).call(result: result)
    end

    private

    def class_builder(main_class)
      default = ::Pathfinder2::Character.classes_info[main_class]
      return "Pathfinder2Character::Classes::#{main_class.camelize}Builder".constantize.new if default

      Pathfinder2Character::Classes::CustomBuilder.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
