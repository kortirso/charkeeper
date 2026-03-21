# frozen_string_literal: true

module Dnd2024
  class LegacyDecorator < ApplicationDecoratorV2
    def call(result:)
      return result unless result['legacy']

      "Dnd2024::Legacies::#{result['legacy'].camelize}Decorator".constantize.new.call(result: result)
    rescue NameError => _e
      result
    end
  end
end
