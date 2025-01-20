# frozen_string_literal: true

module Characters
  class ItemSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id quantity ready_to_use name kind weight price].freeze

    attributes :id, :quantity, :ready_to_use, :name, :kind, :weight, :price

    delegate :kind, :weight, :price, to: :item
    delegate :item, to: :object

    def name
      item.name[I18n.locale.to_s]
    end
  end
end
