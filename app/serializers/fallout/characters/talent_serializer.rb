# frozen_string_literal: true

module Fallout
  module Characters
    class TalentSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id slug title description conditions full_ranked].freeze

      attributes(*ATTRIBUTES)

      def title
        translate(object.title)
      end

      def description
        Charkeeper::Container.resolve('markdown').call(
          value: translate(object.description),
          version: (context ? (context[:version] || nil) : nil),
          initial_version: '0.3.20'
        )
      end

      def conditions # rubocop: disable Metrics/AbcSize
        current_rank = context[:perks][object.id].to_i
        {
          required_level: [object.conditions['level'].to_i, 1].max + (object.info['level_increase'].to_i * current_rank),
          attrs: object.conditions['attrs'] || {}
        }
      end

      def full_ranked # rubocop: disable Naming/PredicateMethod
        object.info['ranks'] == context.dig(:perks, object.id).to_i
      end
    end
  end
end
