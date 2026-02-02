# frozen_string_literal: true

module Daggerheart
  class ProjectSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id title markdown_description description complexity progress].freeze

    attributes(*ATTRIBUTES)

    def markdown_description
      Charkeeper::Container.resolve('markdown').call(value: object.description, version: '0.4.5')
    end
  end
end
