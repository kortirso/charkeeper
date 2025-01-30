# frozen_string_literal: true

module Dnd5Character
  class SubclassDecorateWrapper
    def decorate_character_abilities(result:)
      result[:subclasses].each do |class_name, subclass_name|
        result = subclass_decorator(subclass_name).decorate_character_abilities(
          result: result,
          class_level: result.dig(:classes, class_name)
        )
      end

      result
    end

    private

    def subclass_decorator(subclass_name)
      Characters::Container.resolve("decorators.dnd5_character.subclasses.#{subclass_name}")
    rescue Dry::Container::KeyError => _e
      Characters::Container.resolve('decorators.dnd5_character.dummy_decorator')
    end
  end
end
