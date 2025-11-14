# frozen_string_literal: true

module Homebrews
  class FeatSerializer < ApplicationSerializer
    attributes :id, :title, :description, :origin_value, :bonuses

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
  end
end
