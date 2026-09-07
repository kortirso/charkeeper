# frozen_string_literal: true

module Characters
  class FeatSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id title description raw origin_value].freeze

    attributes(*ATTRIBUTES)

    def title
      translate(object.title)
    end

    def raw
      translate(object.description)
    end

    def description
      Charkeeper::Container.resolve('markdown').call(
        value: translate(object.description),
        version: (context ? (context[:version] || nil) : nil),
        initial_version: '0.3.20'
      )
    end
  end
end
