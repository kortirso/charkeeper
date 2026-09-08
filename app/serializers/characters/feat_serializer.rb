# frozen_string_literal: true

module Characters
  class FeatSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id title description raw origin].freeze

    attributes(*ATTRIBUTES)

    def title
      translate(object.feat.title)
    end

    def raw
      translate(object.feat.description)
    end

    def origin
      object.feat.origin
    end

    def description
      Charkeeper::Container.resolve('markdown').call(
        value: translate(object.feat.description),
        version: (context ? (context[:version] || nil) : nil),
        initial_version: '0.3.20'
      )
    end
  end
end
