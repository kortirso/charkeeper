# frozen_string_literal: true

module Daggerheart
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id slug name level domain].freeze

    attributes :id, :slug, :name, :level, :domain

    delegate :level, :domain, to: :data
    delegate :data, to: :object

    def name
      object.name[I18n.locale.to_s]
    end
  end
end
