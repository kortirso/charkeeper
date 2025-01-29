# frozen_string_literal: true

module Dnd5Character
  class SubclassDecorator
    extend Dry::Initializer

    option :decorator

    def decorate
      result = decorator.decorate

      # дополнить result
      result[:subclasses].each do |class_name, subclass_name|
        result = subclass_decorator(subclass_name).decorate(
          result: result,
          class_level: result.dig(:classes, class_name)
        )
      end

      result
    end

    private

    def subclass_decorator(subclass_name)
      case subclass_name
      when ::Dnd5::Character::CIRCLE_OF_THE_LAND then Dnd5Character::Subclasses::CircleOfTheLandDecorator.new
      else Dnd5Character::Classes::DummyDecorator.new
      end
    end
  end
end
