# frozen_string_literal: true

module CosmereCharacter
  class AncestryBuilder
    def call(result:)
      return result if result[:ancestry].nil?

      ancestry_builder(result[:ancestry]).call(result: result)
    end

    private

    def ancestry_builder(ancestry)
      return CosmereCharacter::Ancestries::HomebrewBuilder.new(id: ancestry) if uuid?(ancestry)

      DummyBuilder.new
    end

    def uuid?(string)
      uuid_regex = /\A[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\z/
      string.match?(uuid_regex)
    end
  end
end
