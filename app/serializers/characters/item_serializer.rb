# frozen_string_literal: true

module Characters
  class ItemSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id quantity ready_to_use notes name kind data state item_id has_description states info bonuses].freeze
    READY_TO_USE_STATES = %w[hands equipment].freeze

    attributes(*ATTRIBUTES)

    delegate :kind, :data, :info, to: :item
    delegate :item, to: :object

    def bonuses
      resp = Panko::ArraySerializer.new(
        object.item.bonuses,
        each_serializer: Characters::BonusSerializer
      )
      JSON.parse(resp.to_json)
    end

    def name
      item.name[I18n.locale.to_s]
    end

    def has_description # rubocop: disable Naming/PredicateMethod, Naming/PredicatePrefix
      item.description[I18n.locale.to_s].present?
    end

    # DEPRECATED
    def ready_to_use # rubocop: disable Naming/PredicateMethod
      READY_TO_USE_STATES.include?(object.state)
    end
  end
end
