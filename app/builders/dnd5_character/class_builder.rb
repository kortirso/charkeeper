# frozen_string_literal: true

module Dnd5Character
  class ClassBuilder
    def call(result:)
      result = class_builder(result[:main_class]).call(result: result)
      result[:hit_dice][::Dnd5::Character::HIT_DICES[result[:main_class]]] = 1
      result
    end

    private

    def class_builder(main_class)
      "Dnd5Character::Classes::#{main_class.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
