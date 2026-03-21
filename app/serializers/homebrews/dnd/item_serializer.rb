# frozen_string_literal: true

module Homebrews
  module Dnd
    class ItemSerializer < ApplicationSerializer
      attributes :id, :name, :kind, :description, :info, :data, :public, :own, :modifiers

      def own # rubocop: disable Naming/PredicateMethod
        return false unless context
        return false unless context[:current_user_id]

        object.user_id == context[:current_user_id]
      end
    end
  end
end
