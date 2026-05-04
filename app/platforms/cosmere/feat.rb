# frozen_string_literal: true

module Cosmere
  class Feat < Feat
    PATH_ORIGIN = 'path'
    ANCESTRY_ORIGIN = 'ancestry'
    RADIANT_PATH_ORIGIN = 'radiant_path'
    SURGE_ORIGIN = 'surge'

    STATIC = 'static' # рендерится текст
    TEXT = 'text' # может вводиться текст
    UPDATE_RESULT = 'update_result' # рендерится, но затемняется

    SELECTABLE_ORIGINS = [0, 1].freeze

    enum :origin, {
      PATH_ORIGIN => 0,
      ANCESTRY_ORIGIN => 1,
      RADIANT_PATH_ORIGIN => 2,
      SURGE_ORIGIN => 3
    }
    enum :kind, { STATIC => 0, TEXT => 1, UPDATE_RESULT => 2 }

    def self.limit_refreshes = {}
  end
end
