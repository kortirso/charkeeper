# frozen_string_literal: true

module Dnd2024
  module Characters
    class TalentSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id title description origin_value multiple selected].freeze

      attributes(*ATTRIBUTES)

      def title
        object.title[I18n.locale.to_s]
      end

      def multiple
        object.info['multiple']
      end

      def description
        Charkeeper::Container.resolve('markdown').call(
          value: object.description[I18n.locale.to_s],
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
