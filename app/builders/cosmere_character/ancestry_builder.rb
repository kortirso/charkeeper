# frozen_string_literal: true

module CosmereCharacter
  class AncestryBuilder
    def call(result:)
      return result if result[:ancestry].nil?

      ancestry_builder(result[:ancestry]).call(result: result)
    end

    private

    def ancestry_builder(ancestry)
      "CosmereCharacter::Ancestries::#{ancestry.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
