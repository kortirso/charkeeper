# frozen_string_literal: true

module Dnd5Character
  class SubraceDecorateWrapper
    def decorate_fresh_character(result:)
      subrace_decorator(result[:subrace]).decorate_fresh_character(result: result)
    end

    def decorate_character_abilities(result:)
      result
    end

    private

    def subrace_decorator(subrace)
      decorator = Characters::Container.resolve("decorators.dnd5_character.subraces.#{subrace}") if subrace
      decorator ||= Characters::Container.resolve('decorators.dnd5_character.dummy_decorator')
      decorator
    end
  end
end
