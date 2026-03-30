# frozen_string_literal: true

module Pathfinder2
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id slug title description origin_value origin_values price info].freeze

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

    def origin_value
      object.origin_value.split(',')
    end

    def origin_values
      object.origin_values.map { |item| I18n.t("tags.pathfinder.general.#{item}") }
    end
  end
end
