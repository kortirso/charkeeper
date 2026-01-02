# frozen_string_literal: true

module Dnd2024
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[name id slug level available_for].freeze

    attributes(*ATTRIBUTES)

    delegate :level, :available_for, to: :data
    delegate :data, to: :object

    def name
      object.name[I18n.locale.to_s]
    end
  end
end
