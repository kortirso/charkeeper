# frozen_string_literal: true

module Dnd2024Character
  class ClassBuilder
    def call(result:)
      result = class_builder(result[:main_class]).call(result: result)
      result[:hit_dice][::Dnd2024::Character::HIT_DICES[result[:main_class]]] = 1
      result
    end

    private

    def class_builder(main_class)
      Charkeeper::Container.resolve("builders.dnd2024_character.classes.#{main_class}")
    end
  end
end
