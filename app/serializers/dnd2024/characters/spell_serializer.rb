# frozen_string_literal: true

module Dnd2024
  module Characters
    class SpellSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id ready_to_use prepared_by spell_ability feat_id notes spell].freeze

      attributes(*ATTRIBUTES)

      delegate :value, to: :object

      def prepared_by
        (value || {})['prepared_by']
      end

      def spell_ability
        (value || {})['spell_ability']
      end

      def spell
        Dnd2024::SpellSerializer.new.serialize(object.feat)
      end
    end
  end
end
