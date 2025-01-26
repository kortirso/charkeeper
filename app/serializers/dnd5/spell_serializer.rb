# frozen_string_literal: true

module Dnd5
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id name level attacking available_for].freeze

    attributes :id, :name, :level, :attacking, :available_for

    def name
      object.name[I18n.locale.to_s]
    end
  end
end
