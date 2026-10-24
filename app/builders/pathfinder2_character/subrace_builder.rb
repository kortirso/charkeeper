# frozen_string_literal: true

module Pathfinder2Character
  class SubraceBuilder
    def call(result:)
      subrace_builder(result[:subrace]).call(result: result)
    end

    private

    def subrace_builder(subrace)
      default = ::Pathfinder2::Character.races[subrace]
      return "Pathfinder2Character::Subraces::#{subrace.camelize}Builder".constantize.new if default

      Pathfinder2Character::Subraces::CustomBuilder.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
