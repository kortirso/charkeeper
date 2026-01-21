# frozen_string_literal: true

module Homebrews
  class FeatSerializer < ApplicationSerializer
    attributes :id, :title, :description, :markdown_description, :origin, :origin_value, :bonuses, :conditions, :limit,
               :limit_refresh, :kind

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

    def markdown_description
      object.description.transform_values { |value|
        Charkeeper::Container.resolve('markdown').call(value: value, version: '0.4.4')
      }
    end

    def limit
      object.description_eval_variables['limit']
    end
  end
end
