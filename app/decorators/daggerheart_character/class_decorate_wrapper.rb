# frozen_string_literal: true

module DaggerheartCharacter
  class ClassDecorateWrapper
    def decorate_fresh_character(result:)
      class_decorator(result[:main_class]).decorate_fresh_character(result: result)
    end

    def decorate_character_abilities(result:)
      result[:classes].each do |class_name, class_level|
        result = class_decorator(class_name).decorate_character_abilities(result: result, class_level: class_level)
      end

      result
    end

    private

    def class_decorator(main_class)
      Charkeeper::Container.resolve("decorators.daggerheart_character.classes.#{main_class}")
    rescue Dry::Container::KeyError => _e
      Charkeeper::Container.resolve('decorators.dummy_decorator')
    end
  end
end
