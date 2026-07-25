# frozen_string_literal: true

module Dc20
  class FeatSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id slug title description origin_value price].freeze

    attributes(*ATTRIBUTES)

    def title
      translate(object.title)
    end

    def price
      object.info['price']
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
