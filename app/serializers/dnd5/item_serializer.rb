# frozen_string_literal: true

module Dnd5
  class ItemSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id kind name weight price].freeze

    attributes :id, :kind, :name, :weight, :price, :data

    def name
      object.name[I18n.locale.to_s]
    end
  end
end
