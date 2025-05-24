# frozen_string_literal: true

module Dnd2024Character
  class SpeciesDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      "Dnd2024Character::Species::#{obj.species.camelize}Decorator".constantize.new(obj)
    rescue NameError => _e
      ApplicationDecorator.new(obj)
    end
  end
end
