# frozen_string_literal: true

module Dnd2024Character
  class LegacyDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      return ApplicationDecorator.new(obj) if obj.legacy.nil?

      "Dnd2024Character::Legacies::#{obj.legacy.camelize}Decorator".constantize.new(obj)
    rescue NameError => _e
      ApplicationDecorator.new(obj)
    end
  end
end
