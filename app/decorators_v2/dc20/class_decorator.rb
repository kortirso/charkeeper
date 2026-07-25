# frozen_string_literal: true

module Dc20
  class ClassDecorator < ApplicationDecoratorV2
    def call(result:)
      "Dc20::Classes::#{result['main_class'].camelize}Decorator".constantize.new.call(result: result)
    end
  end
end
