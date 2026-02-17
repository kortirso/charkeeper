# frozen_string_literal: true

module Pathfinder2Character
  class SubclassBuilder
    def call(result:)
      subclass_builder(result[:subclasses][result[:main_class]]).call(result: result)
    end

    private

    def subclass_builder(subclass_name)
      return DummyBuilder.new if subclass_name.nil?

      "Pathfinder2Character::Subclasses::#{subclass_name.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
