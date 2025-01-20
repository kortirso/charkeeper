# frozen_string_literal: true

module Characters
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id ready_to_use, prepared_by name level attacking comment].freeze

    attributes :id, :ready_to_use, :prepared_by, :name, :level, :attacking, :comment

    delegate :level, :attacking, to: :spell
    delegate :spell, to: :object

    def name
      spell.name[I18n.locale.to_s]
    end

    def comment
      spell.comment[I18n.locale.to_s]
    end
  end
end
