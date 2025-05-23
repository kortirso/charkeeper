# frozen_string_literal: true

module Dnd5Character
  class RaceDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      "Dnd5Character::Races::#{obj.race.capitalize}Decorator".constantize.new(obj)
    end
  end
end
