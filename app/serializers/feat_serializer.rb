# frozen_string_literal: true

class FeatSerializer < ApplicationSerializer
  ATTRIBUTES = %i[id slug title description origin_value conditions info].freeze

  attributes(*ATTRIBUTES)

  def title
    object.title[I18n.locale.to_s]
  end

  def description
    Charkeeper::Container.resolve('markdown').call(
      value: object.description[I18n.locale.to_s],
      version: (context ? (context[:version] || nil) : nil),
      initial_version: '0.3.20'
    )
  end
end
