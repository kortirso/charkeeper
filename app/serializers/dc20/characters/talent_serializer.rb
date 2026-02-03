# frozen_string_literal: true

module Dc20
  module Characters
    class TalentSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id slug title description origin_value level multiple selected].freeze

      attributes(*ATTRIBUTES)

      def title
        translate(object.title)
      end

      def level
        object.conditions['level']
      end

      def multiple
        object.info['multiple']
      end

      def description
        Charkeeper::Container.resolve('markdown').call(
          value: translate(object.description),
          version: (context ? (context[:version] || nil) : nil),
          initial_version: '0.3.20'
        )
      end

      def selected # rubocop: disable Naming/PredicateMethod
        context && context[:selected_talents] ? context[:selected_talents].include?(object.id) : false
      end
    end
  end
end
