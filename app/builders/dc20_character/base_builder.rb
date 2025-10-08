# frozen_string_literal: true

module Dc20Character
  class BaseBuilder
    def call(result:)
      result.merge({
        classes: { result[:main_class] => 1 }
      })
    end
  end
end
