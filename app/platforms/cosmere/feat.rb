# frozen_string_literal: true

module Cosmere
  class Feat < Feat
    PATH_ORIGIN = 'path'
    ANCESTRY_ORIGIN = 'ancestry'
    RADIANT_PATH_ORIGIN = 'radiant_path'
    SURGE_ORIGIN = 'surge'
    SPECIALIZATION_ORIGIN = 'specialization'

    STATIC = 'static' # рендерится текст
    TEXT = 'text' # может вводиться текст
    UPDATE_RESULT = 'update_result' # рендерится, но затемняется
    ONE_FROM_LIST = 'one_from_list' # рендерится список, выбирается одно значение
    MANY_FROM_LIST = 'many_from_list' # рендерится список, выбирается несколько значений
    HIDDEN = 'hidden'

    SELECTABLE_ORIGINS = [].freeze

    enum :origin, {
      PATH_ORIGIN => 0,
      ANCESTRY_ORIGIN => 1,
      RADIANT_PATH_ORIGIN => 2,
      SURGE_ORIGIN => 3,
      SPECIALIZATION_ORIGIN => 4
    }
    enum :kind, { STATIC => 0, TEXT => 1, UPDATE_RESULT => 2, ONE_FROM_LIST => 3, MANY_FROM_LIST => 4, HIDDEN => 5 }

    def self.limit_refreshes = {}
  end
end
