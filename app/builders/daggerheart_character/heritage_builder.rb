# frozen_string_literal: true

module DaggerheartCharacter
  class HeritageBuilder
    def call(result:)
      heritage_builder(result[:heritage]).call(result: result)
    end

    private

    def heritage_builder(heritage)
      "DaggerheartCharacter::Heritages::#{heritage.camelize}Builder".constantize.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
