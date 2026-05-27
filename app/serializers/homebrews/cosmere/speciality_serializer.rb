# frozen_string_literal: true

module Homebrews
  module Cosmere
    class SpecialitySerializer < ApplicationSerializer
      attributes :id, :name, :data, :public, :own

      def own # rubocop: disable Naming/PredicateMethod
        return false unless context
        return false unless context[:current_user_id]

        object.user_id == context[:current_user_id]
      end
    end
  end
end
