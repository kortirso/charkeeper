# frozen_string_literal: true

module Dnd2024
  module Characters
    class SpellSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id ready_to_use prepared_by spell_id].freeze

      attributes :id, :ready_to_use, :prepared_by, :slug, :name, :level, :spell_id

      delegate :slug, to: :spell
      delegate :spell, to: :object
      delegate :data, to: :object

      def name
        object.spell.name[I18n.locale.to_s]
      end

      def level
        object.spell.data.level
      end

      def ready_to_use
        data['ready_to_use']
      end

      def prepared_by
        data['prepared_by']
      end
    end
  end
end
