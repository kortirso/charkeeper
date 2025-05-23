# frozen_string_literal: true

module Pathfinder2Character
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
      when Pathfinder2::Character::FIGHTER then Pathfinder2Character::Classes::FighterDecorator
      else ApplicationDecorator
      end
    end
  end
end
