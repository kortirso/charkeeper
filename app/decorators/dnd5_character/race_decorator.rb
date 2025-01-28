# frozen_string_literal: true

module Dnd5Character
  class RaceDecorator
    extend Dry::Initializer

    option :decorator

    delegate :decorate, to: :decorator
  end
end
