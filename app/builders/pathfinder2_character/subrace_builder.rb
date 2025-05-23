# frozen_string_literal: true

module Pathfinder2Character
  class SubraceBuilder
    def call(result:)
      subrace_builder(result[:subrace]).call(result: result)
    end

    private

    def subrace_builder(subrace)
      Charkeeper::Container.resolve("builders.pathfinder_character.subraces.#{subrace}")
    rescue Dry::Container::KeyError => _e
      Charkeeper::Container.resolve('builders.dummy')
    end
  end
end
