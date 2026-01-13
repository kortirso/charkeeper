# frozen_string_literal: true

class FeatSerializer < ApplicationSerializer
  ATTRIBUTES = %i[id slug title description origin_value conditions info].freeze

  attributes(*ATTRIBUTES)

  def title
    object.title[I18n.locale.to_s]
  end

  def description
    result = Charkeeper::Container.resolve('markdown').call(
      value: object.description[I18n.locale.to_s],
      version: (context ? (context[:version] || nil) : nil),
      initial_version: '0.3.20'
    )
    context && context[:gsub] ? result&.gsub(/{{[a-z]+}}/, 'x') : result
  end
end
