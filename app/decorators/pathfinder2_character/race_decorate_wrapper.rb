# frozen_string_literal: true

module Pathfinder2Character
  class RaceDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      case obj.race
      when Pathfinder2::Character::DWARF then Pathfinder2Character::Races::DwarfDecorator.new(obj)
      else ApplicationDecorator.new(obj)
      end
    end
  end
end
