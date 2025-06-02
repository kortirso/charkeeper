# frozen_string_literal: true

module DaggerheartCharacter
  class HeritageDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      "DaggerheartCharacter::Heritages::#{obj.heritage.camelize}Decorator".constantize.new(obj)
    rescue NameError => _e
      ApplicationDecorator.new(obj)
    end
  end
end
