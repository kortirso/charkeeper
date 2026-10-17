# frozen_string_literal: true

module Pathfinder2Character
  class SubclassBuilder
    def call(result:)
      subclass_builder(result[:main_class], result[:subclasses][result[:main_class]]).call(result: result)
    end

    private

    def subclass_builder(class_name, subclass_name)
      return DummyBuilder.new if subclass_name.nil?

      default = ::Pathfinder2::Character.subclass_info(class_name, subclass_name)
      return "Pathfinder2Character::Subclasses::#{subclass_name.camelize}Builder".constantize.new if default

      Pathfinder2Character::Subclasses::CustomBuilder.new(subclass_name: subclass_name)
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
