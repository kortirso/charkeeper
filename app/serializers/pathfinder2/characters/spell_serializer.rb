# frozen_string_literal: true

module Pathfinder2
  module Characters
    class SpellSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id ready_to_use selected_count used_count notes spell].freeze

      attributes(*ATTRIBUTES)

      def spell
        Pathfinder2::SpellSerializer.new.serialize(object.feat)
      end
    end
  end
end
