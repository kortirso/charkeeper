# frozen_string_literal: true

module Characters
  class ItemSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id quantity ready_to_use notes name kind data state].freeze
    READY_TO_USE_STATES = %w[hands equipment].freeze

    attributes :id, :quantity, :ready_to_use, :notes, :name, :kind, :data, :state

    delegate :kind, :data, to: :item
    delegate :item, to: :object

    def name
      item.name[I18n.locale.to_s]
    end

    # DEPRECATED
    def ready_to_use # rubocop: disable Naming/PredicateMethod
      READY_TO_USE_STATES.include?(object.state)
    end
  end
end
