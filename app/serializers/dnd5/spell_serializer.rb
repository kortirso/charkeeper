# frozen_string_literal: true

module Dnd5
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[name id slug level available_for].freeze

    attributes(*ATTRIBUTES)

    delegate :level, :available_for, to: :data
    delegate :data, to: :object

    def name
      translate(object.name)
    end
  end
end
