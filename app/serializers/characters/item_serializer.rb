# frozen_string_literal: true

module Characters
  class ItemSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id quantity ready_to_use notes name kind data].freeze

    attributes :id, :quantity, :ready_to_use, :notes, :name, :kind, :data

    delegate :kind, :data, to: :item
    delegate :item, to: :object

    def name
      item.name[I18n.locale.to_s]
    end
  end
end
