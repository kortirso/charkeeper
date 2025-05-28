# frozen_string_literal: true

module Pathfinder2Character
  class RaceDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      "Pathfinder2Character::Races::#{obj.race.camelize}Decorator".constantize.new(obj)
    rescue NameError => _e
      ApplicationDecorator.new(obj)
    end
  end
end
