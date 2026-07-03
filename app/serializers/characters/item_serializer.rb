# frozen_string_literal: true

module Characters
  class ItemSerializer < ApplicationSerializer
    ATTRIBUTES = %i[
      id notes name kind data state item_id has_description states info bonuses modifiers item_modifiers custom
      charges charges_max
    ].freeze

    attributes(*ATTRIBUTES)

    delegate :kind, :info, to: :item
    delegate :item, to: :object

    def bonuses
      resp = Panko::ArraySerializer.new(
        object.item.bonuses,
        each_serializer: Characters::BonusSerializer
      )
      JSON.parse(resp.to_json)
    end

    def name
      object.name || translate(item.name)
    end

    def item_modifiers # rubocop: disable Rails/Delegate
      item.modifiers
    end

    def has_description # rubocop: disable Naming/PredicateMethod, Naming/PredicatePrefix
      translate(item.description).present?
    end

    def data
      item.data.attributes
    end

    def custom # rubocop: disable Naming/PredicateMethod
      object.name.present?
    end

    def charges_max
      item.charges
    end
  end
end
