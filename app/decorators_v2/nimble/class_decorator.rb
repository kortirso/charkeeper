# frozen_string_literal: true

module Nimble
  class ClassDecorator < ApplicationDecoratorV2
    def call(result:)
      "Nimble::Classes::#{result['main_class'].camelize}Decorator".constantize.new.call(result: result)
    end
  end
end
