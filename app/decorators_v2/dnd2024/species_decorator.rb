# frozen_string_literal: true

module Dnd2024
  class SpeciesDecorator < ApplicationDecoratorV2
    def call(result:)
      "Dnd2024::Species::#{result['species'].camelize}Decorator".constantize.new.call(result: result)
    rescue NameError => _e
      result
    end
  end
end
