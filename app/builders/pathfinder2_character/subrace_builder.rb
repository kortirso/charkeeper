# frozen_string_literal: true

module Pathfinder2Character
  class SubraceBuilder
    def call(result:)
      subrace_builder(result[:subrace]).call(result: result)
    end

    private

    def subrace_builder(subrace)
      "Pathfinder2Character::Subraces::#{subrace.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
