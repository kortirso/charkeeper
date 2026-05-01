# frozen_string_literal: true

module Cosmere
  class Feat < Feat
    PATH_ORIGIN = 'path'

    STATIC = 'static' # рендерится текст
    TEXT = 'text' # может вводиться текст
    UPDATE_RESULT = 'update_result' # рендерится, но затемняется

    SELECTABLE_ORIGINS = [0].freeze

    enum :origin, {
      PATH_ORIGIN => 0
    }
    enum :kind, { STATIC => 0, TEXT => 1, UPDATE_RESULT => 2 }

    def self.limit_refreshes = {}
  end
end
