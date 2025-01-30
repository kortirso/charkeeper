# frozen_string_literal: true

class DummyDecorator
  def decorate_fresh_character(result:)
    result
  end

  def decorate_character_abilities(result:, class_level:) # rubocop: disable Lint/UnusedMethodArgument
    result
  end
end
