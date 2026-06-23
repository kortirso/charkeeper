# frozen_string_literal: true

module HomebrewsV2
  class ListItemSerializer < ApplicationSerializer
    attributes :id, :title, :description, :own

    def title
      translate(object.name)
    end

    def description
      Charkeeper::Container.resolve('markdown').call(value: translate(object.description), version: '0.4.33')
    end

    def own # rubocop: disable Naming/PredicateMethod
      return false unless context
      return false unless context[:current_user_id]

      object.user_id == context[:current_user_id]
    end
  end
end
