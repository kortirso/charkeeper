# frozen_string_literal: true

module HomebrewsV2
  module Dnd2024
    class SpellSerializer < ApplicationSerializer
      attributes :id, :title, :description, :own, :info, :origin_values, :books

      def title
        "#{object.info['level']} #{translate(object.title)}"
      end

      def description
        Charkeeper::Container.resolve('markdown').call(value: translate(object.description), version: '0.4.4')
      end

      def own # rubocop: disable Naming/PredicateMethod
        return false unless context
        return false unless context[:current_user_id]

        object.user_id == context[:current_user_id]
      end

      def books
        object.homebrew_books.pluck(:name)
      end
    end
  end
end
