# frozen_string_literal: true

module Dnd5Character
  class SubclassDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      obj.subclasses.keys.inject(obj) do |acc, (_class_name, subclass_name)|
        next acc if subclass_name.nil?

        acc = subclass_decorator(subclass_name).new(acc)
        acc
      end
    end

    def subclass_decorator(subclass_name)
      "Dnd5Character::Subclasses::#{subclass_name.camelize}Decorator".constantize
    rescue NameError => _e
      ApplicationDecorator
    end
  end
end
