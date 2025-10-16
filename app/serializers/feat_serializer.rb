# frozen_string_literal: true

class FeatSerializer < ApplicationSerializer
  ATTRIBUTES = %i[id slug title description origin_value conditions].freeze

  attributes(*ATTRIBUTES)

  def title
    object.title[I18n.locale.to_s]
  end

  def description
    object.description[I18n.locale.to_s]
  end
end
