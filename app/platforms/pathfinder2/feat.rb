# frozen_string_literal: true

module Pathfinder2
  class Feat < Feat
    GENERAL_ORIGIN = 'general'
    ANCESTRY_ORIGIN = 'ancestry'
    SKILL_ORIGIN = 'skill'
    CLASS_ORIGIN = 'class'
    SPELL_ORIGIN = 'spell'

    STATIC = 'static' # рендерится текст
    UPDATE_RESULT = 'update_result' # рендерится, но затемняется
    HIDDEN = 'hidden'
    ONE_FROM_LIST = 'one_from_list' # рендерится список, выбирается одно значение
    MANY_FROM_LIST = 'many_from_list' # рендерится список, выбирается несколько значений
    TEXT = 'text' # может вводиться текст

    SHORT_REST = 'short_rest'
    LONG_REST = 'long_rest'

    SELECTABLE_ORIGINS = [0, 1, 2, 3, 4].freeze

    enum :origin, {
      GENERAL_ORIGIN => 0,
      ANCESTRY_ORIGIN => 1,
      SKILL_ORIGIN => 2,
      CLASS_ORIGIN => 3,
      SPELL_ORIGIN => 4
    }
    enum :kind, { STATIC => 0, UPDATE_RESULT => 1, HIDDEN => 2, ONE_FROM_LIST => 3, MANY_FROM_LIST => 4, TEXT => 5 }
    enum :limit_refresh, { SHORT_REST => 0, LONG_REST => 1 }
  end
end
