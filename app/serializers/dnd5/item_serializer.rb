# frozen_string_literal: true

module Dnd5
  class ItemSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id kind name data].freeze

    attributes :id, :kind, :name, :data

    delegate :data, to: :object

    def name
      object.name[I18n.locale.to_s]
    end
  end
end
