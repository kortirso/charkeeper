# frozen_string_literal: true

module Dnd5Character
  class SubraceDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      "Dnd5Character::Subraces::#{obj.subrace&.capitalize}Decorator".constantize.new(obj)
    rescue NameError => _e
      ApplicationDecorator.new(obj)
    end
  end
end
