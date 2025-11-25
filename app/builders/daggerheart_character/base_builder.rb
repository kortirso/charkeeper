# frozen_string_literal: true

module DaggerheartCharacter
  class BaseBuilder
    def call(result:)
      result.merge({
        classes: { result[:main_class] => 1 },
        subclasses: { result[:main_class] => result[:subclass] },
        subclasses_mastery: { result[:subclass] => 1 },
        guide_step: 1,
        money: 10
      })
    end
  end
end
