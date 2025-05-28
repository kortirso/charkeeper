# frozen_string_literal: true

module DaggerheartCharacter
  class ClassBuilder
    def call(result:)
      class_builder(result[:main_class]).call(result: result)
    end

    private

    def class_builder(main_class)
      "DaggerheartCharacter::Classes::#{main_class.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
