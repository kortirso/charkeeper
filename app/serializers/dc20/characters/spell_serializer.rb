# frozen_string_literal: true

module Dc20
  module Characters
    class SpellSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id spell_id].freeze

      attributes(*ATTRIBUTES)

      def spell_id
        object.feat_id
      end
    end
  end
end
