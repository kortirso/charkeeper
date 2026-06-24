# frozen_string_literal: true

module Homebrews
  class BookSerializer < ApplicationSerializer
    attributes :id, :name, :provider, :shared, :enabled, :own

    def enabled # rubocop: disable Naming/PredicateMethod
      context && context[:enabled_books] ? context[:enabled_books].include?(object.id) : false
    end

    def own # rubocop: disable Naming/PredicateMethod
      return false unless context
      return false unless context[:current_user_id]

      object.user_id == context[:current_user_id]
    end
  end
end
