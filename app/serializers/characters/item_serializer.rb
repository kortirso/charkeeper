# frozen_string_literal: true

module Characters
  class ItemSerializer < ApplicationSerializer
    ATTRIBUTES = %i[
      id notes name kind data state item_id has_description states info modifiers item_modifiers custom
      charges charges_max features
    ].freeze

    attributes(*ATTRIBUTES)

    delegate :kind, :info, to: :item
    delegate :item, to: :object

    def name
      object.name || translate(item.name)
    end

    def item_modifiers # rubocop: disable Rails/Delegate
      item.modifiers
    end

    def modifiers
      item.modifiers.transform_values { |value| value['value'] }
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

    def features
      return unless context
      return unless context[:version]

      markdown = Charkeeper::Container.resolve('markdown')
      item.info['features']&.map { |feature| markdown.call(value: translate(feature), version: context[:version]) }
    end
  end
end
