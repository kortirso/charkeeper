# frozen_string_literal: true

module Homebrews
  class FeatSerializer < ApplicationSerializer
    attributes :id, :title, :description, :origin, :origin_value, :bonuses, :conditions

    def bonuses
      return [] unless context
      return [] unless context[:bonuses]

      context[:bonuses].select { |item| item.bonusable_id == object.id }.map do |item|
        {
          id: item.id,
          value: item.value,
          dynamic_value: item.dynamic_value
        }
      end
    end

    def description
      object.description.transform_values { |value| Charkeeper::Container.resolve('markdown').call(value: value) }
    end
  end
end
