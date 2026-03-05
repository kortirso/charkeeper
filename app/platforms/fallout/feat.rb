# frozen_string_literal: true

module Fallout
  class Feat < Feat
    GENERAL_ORIGIN = 'general'

    STATIC = 'static' # рендерится текст
    UPDATE_RESULT = 'update_result' # рендерится, но затемняется
    HIDDEN = 'hidden'
    ONE_FROM_LIST = 'one_from_list' # рендерится список, выбирается одно значение
    MANY_FROM_LIST = 'many_from_list' # рендерится список, выбирается несколько значений
    TEXT = 'text' # может вводиться текст

    SELECTABLE_ORIGINS = [0].freeze

    enum :origin, {
      GENERAL_ORIGIN => 0
    }
    enum :kind, { STATIC => 0, UPDATE_RESULT => 1, HIDDEN => 2, ONE_FROM_LIST => 3, MANY_FROM_LIST => 4, TEXT => 5 }
  end
end
