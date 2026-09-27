# frozen_string_literal: true

module CosmereCharacter
  class PathBuilder
    def call(result:)
      return result if result[:path].nil?

      path_builder(result[:path]).call(result: result)
    end

    private

    def path_builder(path)
      return CosmereCharacter::Paths::HomebrewBuilder.new(id: path) if uuid?(path)

      "CosmereCharacter::Paths::#{path.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end

    def uuid?(string)
      uuid_regex = /\A[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\z/
      string.match?(uuid_regex)
    end
  end
end
