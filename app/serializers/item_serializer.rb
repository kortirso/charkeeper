# frozen_string_literal: true

class ItemSerializer < ApplicationSerializer
  ATTRIBUTES = %i[id slug kind name data].freeze

  attributes :id, :slug, :kind, :name, :data

  def name
    object.name[I18n.locale.to_s]
  end
end
