# frozen_string_literal: true

module CosmereCharacter
  class PathBuilder
    def call(result:)
      return result if result[:path].nil?

      path_builder(result[:path]).call(result: result)
    end

    private

    def path_builder(path)
      "CosmereCharacter::Paths::#{path.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
