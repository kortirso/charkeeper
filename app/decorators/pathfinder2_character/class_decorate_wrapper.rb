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
      "Pathfinder2Character::Classes::#{class_name.camelize}Decorator".constantize
    rescue NameError => _e
      ApplicationDecorator
    end
  end
end
