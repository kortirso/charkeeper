# frozen_string_literal: true

module Daggerheart
  module Characters
    class FeatSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id slug title description ready_to_use notes].freeze

      attributes(*ATTRIBUTES)

      def slug
        object.feat.slug
      end

      def title
        object.feat.title[I18n.locale.to_s]
      end

      def description
        Charkeeper::Container.resolve('markdown').call(
          value: object.feat.description[I18n.locale.to_s],
          version: (context ? (context[:version] || nil) : nil),
          initial_version: '0.3.20'
        )
      end
    end
  end
end
