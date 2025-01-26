# frozen_string_literal: true

module Dnd5
  module Characters
    class SpellSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id ready_to_use prepared_by name level comment spell_id].freeze

      attributes :id, :ready_to_use, :prepared_by, :name, :level, :comment, :spell_id

      delegate :level, to: :spell
      delegate :spell, to: :object

      def name
        spell.name[I18n.locale.to_s]
      end

      def comment
        spell.comment[I18n.locale.to_s]
      end
    end
  end
end
