# frozen_string_literal: true

module Dnd5
  module Characters
    class SpellSerializer < ApplicationSerializer
      ATTRIBUTES = %i[id ready_to_use prepared_by spell_ability notes slug name level spell_id].freeze

      attributes(*ATTRIBUTES)

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

      def spell_ability
        data['spell_ability']
      end
    end
  end
end
