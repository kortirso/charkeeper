# frozen_string_literal: true

module DaggerheartCharacter
  class ClassDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      obj.classes.keys.inject(obj) do |acc, class_name|
        acc = class_decorator(class_name).new(acc)
        acc
      end
    end

    def class_decorator(class_name)
      case class_name
      when Daggerheart::Character::WARRIOR then DaggerheartCharacter::Classes::WarriorDecorator
      else ApplicationDecorator
      end
    end
  end
end
