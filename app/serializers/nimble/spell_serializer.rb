# frozen_string_literal: true

module Nimble
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id slug title description origin origin_value info].freeze

    attributes(*ATTRIBUTES)

    def title
      translate(object.title)
    end

    def description
      result = Charkeeper::Container.resolve('markdown').call(
        value: translate(object.description),
        version: (context ? (context[:version] || nil) : nil),
        initial_version: '0.4.0'
      )
      result.scan(/\{\{([^}]+)\}\}/).flatten.each do |value|
        _, default = value.split('|')
        result.gsub!("{{#{value}}}", default)
      end
      result
    end
  end
end
