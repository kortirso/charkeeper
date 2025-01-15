# frozen_string_literal: true

module Characters
  class ItemSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id quantity ready_to_use name kind weight price].freeze

    attributes :id, :quantity, :ready_to_use, :name, :kind, :weight, :price

    delegate :name, :kind, :weight, :price, to: :item

    def item
      object.item
    end
  end
end
