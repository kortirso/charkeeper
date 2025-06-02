# frozen_string_literal: true

module DaggerheartCharacter
  class BaseBuilder
    def call(result:)
      result.merge({
        classes: { result[:main_class] => 1 },
        subclasses: { result[:main_class] => result[:subclass] }
      })
    end
  end
end
