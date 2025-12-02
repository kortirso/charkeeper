# frozen_string_literal: true

module Daggerheart
  module Characters
    class FeatSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id slug title description origin_value ready_to_use notes info level].freeze

      attributes(*ATTRIBUTES)

      delegate :slug, :info, :origin_value, to: :feat
      delegate :feat, to: :object

      def title
        feat.title[I18n.locale.to_s]
      end

      def level
        feat.conditions['level']
      end

      def description
        Charkeeper::Container.resolve('markdown').call(
          value: feat.description[I18n.locale.to_s],
          version: (context ? (context[:version] || nil) : nil),
          initial_version: '0.3.20'
        )
      end
    end
  end
end
