# frozen_string_literal: true

module Dnd2024
  class ClassDecorator < ApplicationDecoratorV2
    def call(result:)
      class_keys = result['classes'].keys
      class_keys.each { |class_name| result = class_decorator(class_name).call(result: result) }
      result
    end

    private

    def class_decorator(class_name)
      default = ::Dnd2024::Character.classes_info[class_name]
      return "Dnd2024::Classes::#{class_name.camelize}Decorator".constantize.new if default

      Dnd2024::Classes::CustomDecorator.new(class_name: class_name)
    end
  end
end
