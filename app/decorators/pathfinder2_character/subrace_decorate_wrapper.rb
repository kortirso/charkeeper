# frozen_string_literal: true

module Pathfinder2Character
  class SubraceDecorateWrapper
    def decorate_fresh_character(result:)
      subrace_decorator(result[:subrace]).decorate_fresh_character(result: result)
    end

    def decorate_character_abilities(result:)
      subrace_decorator(result[:subrace]).decorate_character_abilities(result: result)
    end

    private

    def subrace_decorator(subrace)
      Charkeeper::Container.resolve("decorators.pathfinder2_character.subraces.#{subrace}")
    rescue Dry::Container::KeyError => _e
      Charkeeper::Container.resolve('decorators.dummy_decorator')
    end
  end
end
