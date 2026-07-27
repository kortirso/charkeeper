# frozen_string_literal: true

module NimbleCharacter
  class BaseBuilder
    def call(result:)
      result.merge({
        guide_step: result[:skip_guide] ? nil : 1
      }).except(:skip_guide)
    end
  end
end
