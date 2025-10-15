# frozen_string_literal: true

module Dnd5
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id slug name level available_for].freeze

    attributes(*ATTRIBUTES)

    delegate :level, :available_for, to: :data
    delegate :data, to: :object

    def name
      object.name[I18n.locale.to_s]
    end
  end
end
