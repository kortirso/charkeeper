# frozen_string_literal: true

module Pathfinder2Character
  class BaseBuilder
    def call(result:)
      result.merge({
        classes: { result[:main_class] => 1 },
        languages: []
      })
    end
  end
end
