# frozen_string_literal: true

module Nimble
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id slug title description origin_value origin_values info].freeze

    attributes(*ATTRIBUTES)

    def title
      translate(object.title)
    end

    def description
      Charkeeper::Container.resolve('markdown').call(
        value: translate(object.description),
        version: (context ? (context[:version] || nil) : nil),
        initial_version: '0.4.0'
      )
    end
  end
end
