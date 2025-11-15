# frozen_string_literal: true

module Dnd2024Character
  class ClassDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      obj.classes.keys.inject(obj) do |acc, class_name|
        acc = class_decorator(class_name).new(acc)
        acc
      end
    end

    def class_decorator(class_name)
      "Dnd2024Character::Classes::#{class_name.camelize}Decorator".constantize
    end
  end
end
