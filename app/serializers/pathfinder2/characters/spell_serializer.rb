# frozen_string_literal: true

module Pathfinder2
  module Characters
    class SpellSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id ready_to_use value notes spell kind].freeze

      attributes(*ATTRIBUTES)

      def spell
        Pathfinder2::SpellSerializer.new(context: context).serialize(object.feat)
      end
    end
  end
end
