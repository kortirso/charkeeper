# frozen_string_literal: true

module Daggerheart
  module Characters
    class SpellSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id ready_to_use notes slug name level].freeze

      attributes :id, :ready_to_use, :notes, :slug, :name, :level

      delegate :slug, to: :spell
      delegate :spell, :data, to: :object

      def name
        object.spell.name[I18n.locale.to_s]
      end

      def level
        object.spell.data.level
      end

      def ready_to_use
        data['ready_to_use']
      end
    end
  end
end
