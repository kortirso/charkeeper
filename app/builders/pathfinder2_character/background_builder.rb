# frozen_string_literal: true

module Pathfinder2Character
  class BackgroundBuilder
    def call(result:)
      background_builder(result[:background]).call(result: result)
    end

    private

    def background_builder(background)
      "Pathfinder2Character::Backgrounds::#{background.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
