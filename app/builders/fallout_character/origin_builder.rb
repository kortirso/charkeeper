# frozen_string_literal: true

module FalloutCharacter
  class OriginBuilder
    def call(result:)
      origin_builder(result[:origin]).call(result: result)
    end

    private

    def origin_builder(origin)
      "FalloutCharacter::Origins::#{origin.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
