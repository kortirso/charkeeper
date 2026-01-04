# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class RecipeSerializer < ApplicationSerializer
      attributes :id, :tool_id, :item_id, :public, :own

      def own # rubocop: disable Naming/PredicateMethod
        return false unless context
        return false unless context[:current_user_id]

        object.user_id == context[:current_user_id]
      end
    end
  end
end
