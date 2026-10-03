# frozen_string_literal: true

module Dnd2024Character
  class ClassBuilder
    def call(result:)
      class_builder(result[:main_class]).call(result: result)
    end

    private

    def class_builder(main_class)
      default = ::Dnd2024::Character.classes_info[main_class]
      return "Dnd2024Character::Classes::#{main_class.camelize}Builder".constantize.new if default

      Dnd2024Character::Classes::CustomBuilder.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
