# frozen_string_literal: true

module Characters
  class NoteSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id title value].freeze

    attributes :id, :title, :value
  end
end
