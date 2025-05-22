# frozen_string_literal: true

module Pathfinder2Character
  class SubraceDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      ApplicationDecorator.new(obj)
    end
  end
end
