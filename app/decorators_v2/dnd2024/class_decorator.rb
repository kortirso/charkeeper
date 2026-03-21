# frozen_string_literal: true

module Dnd2024
  class ClassDecorator < ApplicationDecoratorV2
    def call(result:)
      class_keys = result['classes'].keys
      class_keys.each { |class_name| result = class_decorator(class_name).new.call(result: result) }
      result
    end

    private

    def class_decorator(class_name)
      "Dnd2024::Classes::#{class_name.camelize}Decorator".constantize
    end
  end
end
