# frozen_string_literal: true

module Pathfinder2
  module Characters
    class FormulaSerializer < ApplicationSerializer
      ATTRIBUTES = %i[formula_id id kind name info data].freeze

      attributes(*ATTRIBUTES)

      delegate :id, :kind, :info, :data, to: :item
      delegate :item, to: :object

      def name
        translate(object.item.name)
      end

      def formula_id
        object.id
      end
    end
  end
end
