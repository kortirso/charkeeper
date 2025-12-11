# frozen_string_literal: true

module Dnd5
  class Feat < Feat
    RACE_ORIGIN = 'race'
    SUBRACE_ORIGIN = 'subrace'
    CLASS_ORIGIN = 'class'
    SUBCLASS_ORIGIN = 'subclass'
    CHARACTER_ORIGIN = 'character'

    STATIC = 'static'
    TEXT = 'text'
    UPDATE_RESULT = 'update_result' # не рендерится, обновляются данные декоратора
    ONE_FROM_LIST = 'one_from_list' # рендерится список, выбирается одно значение
    MANY_FROM_LIST = 'many_from_list' # рендерится список, выбирается несколько значений
    HIDDEN = 'hidden'

    SHORT_REST = 'short_rest'
    LONG_REST = 'long_rest'

    SELECTABLE_ORIGINS = [4].freeze

    enum :origin, { RACE_ORIGIN => 0, SUBRACE_ORIGIN => 1, CLASS_ORIGIN => 2, SUBCLASS_ORIGIN => 3, CHARACTER_ORIGIN => 4 }
    enum :kind, {
      STATIC => 0, TEXT => 1, UPDATE_RESULT => 2, ONE_FROM_LIST => 3, MANY_FROM_LIST => 4, HIDDEN => 5
    }
    enum :limit_refresh, { SHORT_REST => 0, LONG_REST => 1 }
  end
end
