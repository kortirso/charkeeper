# frozen_string_literal: true

module Dnd5
  class ItemSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id slug kind name data].freeze

    attributes :id, :slug, :kind, :name, :data

    delegate :data, to: :object

    def name
      object.name[I18n.locale.to_s]
    end
  end
end
