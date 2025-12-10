# frozen_string_literal: true

module Dc20Character
  class ClassDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      "Dc20Character::Classes::#{obj.main_class.camelize}Decorator".constantize.new(obj)
    rescue NameError => _e
      ApplicationDecorator.new(obj)
    end
  end
end
