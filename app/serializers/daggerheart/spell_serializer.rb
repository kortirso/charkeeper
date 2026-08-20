# frozen_string_literal: true

module Daggerheart
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id slug title description origin_value conditions info].freeze

    attributes(*ATTRIBUTES)

    def origin_value
      context[:extra_domains][object.origin_value] || object.origin_value
    end

    def title
      translate(object.title)
    end

    def description
      result = Charkeeper::Container.resolve('markdown').call(
        value: translate(object.description),
        version: (context ? (context[:version] || nil) : nil),
        initial_version: '0.3.20'
      )
      return unless result

      result.scan(/\{\{([^}]+)\}\}/).flatten.each do |value|
        _variable, default = value.split('|')

        result.gsub!("{{#{value}}}", default || '')
      end
      result
    end
  end
end
