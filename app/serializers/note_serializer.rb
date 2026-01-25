# frozen_string_literal: true

class NoteSerializer < ApplicationSerializer
  attributes :id, :title, :value, :markdown_value

  def markdown_value
    Charkeeper::Container.resolve('markdown').call(value: object.value, version: '0.4.4')
  end
end
